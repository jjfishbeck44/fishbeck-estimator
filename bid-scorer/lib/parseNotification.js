// bid-scorer/lib/parseNotification.js
// Heuristic parser for raw bid-notification email text.
// Pulls Subject, From, agency, deadline, body, and any linked spec URLs into
// the normalized `bid` shape that scoreBid() consumes.
//
// This handles the plain-text and lightly-structured notifications most
// agencies send. When we wire up IMAP, mailparser will hand us the body
// already separated from headers — we'll pass body to extractAgency() etc.
// directly instead of running the full parse.

const URL_RE = /https?:\/\/[^\s)>\]"']+/g;

const HEADER_RES = {
  subject: /^Subject:\s*(.+)$/im,
  from: /^From:\s*(.+)$/im,
  to: /^To:\s*(.+)$/im,
  date: /^Date:\s*(.+)$/im
};

const AGENCY_LABELS_RE = /^Agency:\s*(.+)$/im;
const POSTED_RE = /^Posted:\s*(.+)$/im;
const DUE_RES = [
  /^Due:\s*(.+)$/im,
  /^Response Due:\s*(.+)$/im,
  /^Closing Date:\s*(.+)$/im,
  /^Bid Due:\s*(.+)$/im,
  /due (?:by|on)\s+([A-Z][a-z]+ \d{1,2},?\s*\d{4}(?:\s*at\s*\d{1,2}:\d{2}\s*[AP]M)?)/i,
  /(\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}(?:\s*[A-Z]{3})?)?)\s*(?:closing|due|deadline)/i
];

// Domain → human-readable agency label. Used as a fallback when no Agency:
// header is present (real notification emails rarely include one).
const DOMAIN_AGENCY_MAP = {
  'mphaonline.org': 'Minneapolis Public Housing Authority',
  'stpha.org': 'Saint Paul Public Housing Agency',
  'state.mn.us': 'State of Minnesota',
  'mn.gov': 'State of Minnesota',
  'mndot.gov': 'Minnesota Department of Transportation',
  'hennepin.us': 'Hennepin County',
  'co.dakota.mn.us': 'Dakota County',
  'co.ramsey.mn.us': 'Ramsey County',
  'ramseycounty.us': 'Ramsey County',
  'anokacountymn.gov': 'Anoka County',
  'co.washington.mn.us': 'Washington County',
  'minneapolismn.gov': 'City of Minneapolis',
  'stpaul.gov': 'City of Saint Paul',
  'mpls.k12.mn.us': 'Minneapolis Public Schools',
  'spps.org': 'Saint Paul Public Schools',
  'procureware.com': 'ProcureWare-hosted bid',
  'demandstar.com': 'DemandStar-hosted bid',
  'sam.gov': 'SAM.gov (Federal)',
  'aeon.org': 'Aeon',
  'commonbond.org': 'CommonBond Communities',
  'dominiumapartments.com': 'Dominium',
  'umn.edu': 'University of Minnesota',
  'minnstate.edu': 'Minnesota State (MnSCU)'
};

function extractHeader(raw, re) {
  const m = raw.match(re);
  return m ? m[1].trim() : null;
}

function extractDue(raw) {
  for (const re of DUE_RES) {
    const m = raw.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function extractFromAddress(raw) {
  const from = extractHeader(raw, HEADER_RES.from);
  if (!from) return null;
  const angle = from.match(/<([^>]+)>/);
  return (angle ? angle[1] : from).trim();
}

function extractAgency(raw) {
  const declared = extractHeader(raw, AGENCY_LABELS_RE);
  if (declared) return declared;

  const fromAddr = extractFromAddress(raw);
  if (fromAddr) {
    const domain = fromAddr.split('@')[1];
    if (domain) {
      for (const key of Object.keys(DOMAIN_AGENCY_MAP)) {
        if (domain.toLowerCase().endsWith(key)) return DOMAIN_AGENCY_MAP[key];
      }
    }
  }
  return null;
}

function extractBody(raw) {
  // If the email follows our fixture convention with "--- Notification body ---"
  // markers, use those. Otherwise treat everything after the last header line
  // as body.
  const bodyMarker = raw.indexOf('--- Notification body ---');
  const specMarker = raw.indexOf('--- Spec excerpt ---');

  if (bodyMarker >= 0) {
    const end = specMarker > bodyMarker ? specMarker : raw.length;
    return raw.slice(bodyMarker + '--- Notification body ---'.length, end).trim();
  }

  // Strip RFC-822-ish headers: lines like "Header: value" at the top of the
  // message, ending at the first blank line.
  const blankIdx = raw.search(/\r?\n\r?\n/);
  if (blankIdx >= 0) return raw.slice(blankIdx).trim();
  return raw.trim();
}

function extractSpecText(raw) {
  const specMarker = raw.indexOf('--- Spec excerpt ---');
  if (specMarker < 0) return null;
  return raw.slice(specMarker + '--- Spec excerpt ---'.length).trim() || null;
}

function extractLinks(raw) {
  const matches = raw.match(URL_RE) || [];
  // Dedupe while preserving order, drop trailing punctuation noise.
  const seen = new Set();
  const out = [];
  for (let url of matches) {
    url = url.replace(/[.,;:)\]]+$/, '');
    if (!seen.has(url)) {
      seen.add(url);
      out.push(url);
    }
  }
  return out;
}

function looksLikePdf(url) {
  return /\.pdf(\?|#|$)/i.test(url);
}

function parseNotification(raw) {
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new Error('empty_notification');
  }

  const subject = extractHeader(raw, HEADER_RES.subject);
  const from = extractHeader(raw, HEADER_RES.from);
  const date = extractHeader(raw, HEADER_RES.date);
  const postedAt = extractHeader(raw, POSTED_RE) || date;
  const dueAt = extractDue(raw);
  const agency = extractAgency(raw);
  const body = extractBody(raw);
  const specText = extractSpecText(raw);
  const links = extractLinks(raw);
  const specPdfUrls = links.filter(looksLikePdf);

  return {
    subject,
    from,
    agency,
    postedAt,
    dueAt,
    body,
    specText,
    links,
    specPdfUrls
  };
}

module.exports = {
  parseNotification,
  extractAgency,
  extractDue,
  extractLinks,
  extractBody,
  extractSpecText
};
