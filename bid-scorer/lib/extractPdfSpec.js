// bid-scorer/lib/extractPdfSpec.js
// Extracts text from a bid spec PDF. Accepts either a URL (fetched via global
// fetch) or a Buffer. Returns { text, pages, info, source }.
//
// The PDF parser is injectable so tests can mock it without touching pdf-parse.
// In production, pdf-parse is loaded lazily so importing this module is cheap.

const MAX_PDF_BYTES = 25 * 1024 * 1024;       // 25 MB safety cap
const MAX_TEXT_CHARS = 200_000;               // truncate to keep Claude prompt sane
const FETCH_TIMEOUT_MS = 30_000;

let _defaultParser = null;
async function getDefaultParser() {
  if (!_defaultParser) {
    const mod = require('pdf-parse');
    _defaultParser = mod.default || mod;
  }
  return _defaultParser;
}

async function fetchPdfBuffer(url, opts) {
  const fetchImpl = (opts && opts.fetch) || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetch_unavailable');

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    : null;

  try {
    const res = await fetchImpl(url, controller ? { signal: controller.signal } : {});
    if (!res.ok) throw new Error(`pdf_fetch_failed_${res.status}`);

    const lenHeader = res.headers && res.headers.get && res.headers.get('content-length');
    if (lenHeader && Number(lenHeader) > MAX_PDF_BYTES) {
      throw new Error('pdf_too_large');
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_PDF_BYTES) throw new Error('pdf_too_large');
    return Buffer.from(arrayBuffer);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function truncate(text) {
  if (text.length <= MAX_TEXT_CHARS) return text;
  return text.slice(0, MAX_TEXT_CHARS) + '\n[... truncated ...]';
}

async function extractPdfSpec(source, opts) {
  opts = opts || {};
  let buffer;
  let sourceLabel;

  if (Buffer.isBuffer(source)) {
    buffer = source;
    sourceLabel = 'buffer';
  } else if (typeof source === 'string') {
    buffer = await fetchPdfBuffer(source, opts);
    sourceLabel = source;
  } else {
    throw new Error('invalid_pdf_source');
  }

  const parse = opts.parse || (await getDefaultParser());
  const result = await parse(buffer);
  const text = truncate((result.text || '').trim());

  return {
    text,
    pages: result.numpages ?? result.pages ?? null,
    info: result.info || null,
    source: sourceLabel
  };
}

async function enrichBidWithSpec(bid, opts) {
  if (!bid.specPdfUrls || bid.specPdfUrls.length === 0) return bid;
  if (bid.specText) return bid;

  const url = bid.specPdfUrls[0];
  try {
    const extracted = await extractPdfSpec(url, opts);
    return { ...bid, specText: extracted.text, specPdfPages: extracted.pages };
  } catch (err) {
    return { ...bid, specFetchError: err.message };
  }
}

module.exports = {
  extractPdfSpec,
  enrichBidWithSpec,
  MAX_PDF_BYTES,
  MAX_TEXT_CHARS
};
