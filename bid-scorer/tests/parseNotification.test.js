// bid-scorer/tests/parseNotification.test.js
const fs = require('fs');
const path = require('path');

const {
  parseNotification,
  extractAgency,
  extractDue,
  extractLinks,
  extractBody
} = require('../lib/parseNotification');

function fixture(name) {
  return fs.readFileSync(
    path.join(__dirname, '..', 'fixtures', 'emails', name),
    'utf8'
  );
}

describe('parseNotification() — MPHA notification', () => {
  const raw = fixture('mpha-notification.eml');

  test('pulls subject', () => {
    const bid = parseNotification(raw);
    expect(bid.subject).toMatch(/IFB-2026-042/);
  });

  test('infers agency from From: domain', () => {
    const bid = parseNotification(raw);
    expect(bid.agency).toBe('Minneapolis Public Housing Authority');
  });

  test('captures Response Due date', () => {
    const bid = parseNotification(raw);
    expect(bid.dueAt).toMatch(/June 28, 2026/);
  });

  test('extracts links', () => {
    const bid = parseNotification(raw);
    expect(bid.links.length).toBeGreaterThanOrEqual(2);
    expect(bid.links.some((u) => u.includes('bonfirehub.com'))).toBe(true);
  });

  test('flags PDF links specifically', () => {
    const bid = parseNotification(raw);
    expect(bid.specPdfUrls.length).toBe(1);
    expect(bid.specPdfUrls[0]).toMatch(/\.pdf$/);
  });

  test('body contains scope keywords', () => {
    const bid = parseNotification(raw);
    expect(bid.body).toMatch(/unit turnover/i);
    expect(bid.body).toMatch(/Interior painting/);
  });
});

describe('parseNotification() — Hennepin notification', () => {
  const raw = fixture('hennepin-notification.eml');

  test('infers agency from procureware domain', () => {
    const bid = parseNotification(raw);
    expect(bid.agency).toMatch(/ProcureWare|Hennepin/);
  });

  test('captures Closing Date', () => {
    const bid = parseNotification(raw);
    expect(bid.dueAt).toMatch(/July 22, 2026/);
  });

  test('captures spec PDF link', () => {
    const bid = parseNotification(raw);
    expect(bid.specPdfUrls.some((u) => u.includes('spec-package.pdf'))).toBe(true);
  });
});

describe('parseNotification() — SPPS notification', () => {
  const raw = fixture('spps-notification.eml');

  test('infers agency from spps.org domain', () => {
    const bid = parseNotification(raw);
    expect(bid.agency).toBe('Saint Paul Public Schools');
  });

  test('captures From address with display name', () => {
    const bid = parseNotification(raw);
    expect(bid.from).toMatch(/purchasing@spps.org/);
  });
});

describe('parseNotification() — edge cases', () => {
  test('throws on empty input', () => {
    expect(() => parseNotification('')).toThrow('empty_notification');
    expect(() => parseNotification(null)).toThrow('empty_notification');
  });

  test('returns nulls gracefully when headers are missing', () => {
    const bid = parseNotification('Just a body with no headers\nand a link https://example.com/spec.pdf');
    expect(bid.subject).toBeNull();
    expect(bid.from).toBeNull();
    expect(bid.specPdfUrls).toEqual(['https://example.com/spec.pdf']);
  });

  test('Agency: header overrides domain inference', () => {
    const raw = [
      'From: noreply@mphaonline.org',
      'Subject: Test',
      'Agency: Custom Agency Override',
      '',
      'Body'
    ].join('\n');
    expect(extractAgency(raw)).toBe('Custom Agency Override');
  });

  test('extractLinks dedupes and strips trailing punctuation', () => {
    const links = extractLinks('see https://x.com/a, and https://x.com/a.');
    expect(links).toEqual(['https://x.com/a']);
  });

  test('extractDue matches multiple phrasings', () => {
    expect(extractDue('Closing Date: July 22, 2026')).toMatch(/July 22, 2026/);
    expect(extractDue('Bid Due: 2026-07-15')).toMatch(/2026-07-15/);
    expect(extractDue('Response is due by August 1, 2026')).toMatch(/August 1, 2026/);
  });

  test('extractBody falls back to post-header content when no marker', () => {
    const raw = 'Subject: Test\nFrom: a@b.com\n\nThis is the body content.';
    expect(extractBody(raw)).toMatch(/This is the body content/);
  });
});
