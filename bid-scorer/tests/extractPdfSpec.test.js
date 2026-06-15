// bid-scorer/tests/extractPdfSpec.test.js
const { extractPdfSpec, enrichBidWithSpec, MAX_TEXT_CHARS } = require('../lib/extractPdfSpec');

function fakeParser(text, pages = 1) {
  return jest.fn().mockResolvedValue({ text, numpages: pages, info: { Title: 't' } });
}

function fakeFetch(buffer, opts) {
  opts = opts || {};
  return jest.fn().mockResolvedValue({
    ok: opts.ok !== false,
    status: opts.status || 200,
    headers: { get: () => opts.contentLength || null },
    arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  });
}

describe('extractPdfSpec()', () => {
  test('parses from a Buffer using injected parser', async () => {
    const parse = fakeParser('SECTION 09 91 23 INTERIOR PAINTING\n2.1 Contractor choice...');
    const result = await extractPdfSpec(Buffer.from('fake-pdf-bytes'), { parse });
    expect(parse).toHaveBeenCalledTimes(1);
    expect(result.text).toMatch(/SECTION 09 91 23/);
    expect(result.source).toBe('buffer');
    expect(result.pages).toBe(1);
  });

  test('fetches from a URL using injected fetch + parser', async () => {
    const parse = fakeParser('Paint spec body');
    const fetchImpl = fakeFetch(Buffer.from('x'.repeat(100)));
    const result = await extractPdfSpec('https://example.com/spec.pdf', {
      parse, fetch: fetchImpl
    });
    expect(fetchImpl).toHaveBeenCalledWith('https://example.com/spec.pdf', expect.anything());
    expect(result.text).toBe('Paint spec body');
    expect(result.source).toBe('https://example.com/spec.pdf');
  });

  test('truncates very long text', async () => {
    const huge = 'A'.repeat(MAX_TEXT_CHARS + 500);
    const parse = fakeParser(huge);
    const result = await extractPdfSpec(Buffer.from('x'), { parse });
    expect(result.text.length).toBeLessThanOrEqual(MAX_TEXT_CHARS + 50);
    expect(result.text).toMatch(/truncated/);
  });

  test('throws on non-OK HTTP', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false, status: 404,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(0)
    });
    await expect(extractPdfSpec('https://x/y.pdf', { parse: fakeParser('x'), fetch: fetchImpl }))
      .rejects.toThrow(/pdf_fetch_failed_404/);
  });

  test('rejects content-length over cap', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => String(30 * 1024 * 1024) },
      arrayBuffer: async () => new ArrayBuffer(0)
    });
    await expect(extractPdfSpec('https://x/y.pdf', { parse: fakeParser('x'), fetch: fetchImpl }))
      .rejects.toThrow(/pdf_too_large/);
  });

  test('rejects unknown source types', async () => {
    await expect(extractPdfSpec(12345, { parse: fakeParser('x') })).rejects.toThrow(/invalid_pdf_source/);
  });
});

describe('enrichBidWithSpec()', () => {
  test('passes through when no spec PDF URLs', async () => {
    const bid = { subject: 'x', specPdfUrls: [] };
    const result = await enrichBidWithSpec(bid, { parse: fakeParser('x') });
    expect(result).toBe(bid);
  });

  test('passes through when specText already populated', async () => {
    const bid = { specText: 'already have it', specPdfUrls: ['https://x/y.pdf'] };
    const parse = fakeParser('would replace');
    const result = await enrichBidWithSpec(bid, { parse });
    expect(result.specText).toBe('already have it');
    expect(parse).not.toHaveBeenCalled();
  });

  test('populates specText from first PDF URL', async () => {
    const bid = { subject: 'x', specPdfUrls: ['https://example.com/a.pdf', 'https://example.com/b.pdf'] };
    const parse = fakeParser('Detailed spec text from PDF A');
    const fetchImpl = fakeFetch(Buffer.from('x'.repeat(100)));
    const result = await enrichBidWithSpec(bid, { parse, fetch: fetchImpl });
    expect(result.specText).toMatch(/Detailed spec/);
    expect(result.specPdfPages).toBe(1);
    expect(fetchImpl).toHaveBeenCalledWith('https://example.com/a.pdf', expect.anything());
  });

  test('captures error without throwing when PDF fetch fails', async () => {
    const bid = { subject: 'x', specPdfUrls: ['https://example.com/dead.pdf'] };
    const fetchImpl = jest.fn().mockRejectedValue(new Error('ECONNRESET'));
    const result = await enrichBidWithSpec(bid, { parse: fakeParser('x'), fetch: fetchImpl });
    expect(result.specFetchError).toBe('ECONNRESET');
    expect(result.specText).toBeUndefined();
  });
});
