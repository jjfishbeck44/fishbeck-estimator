const { buildEstimatePdf, toBytes, sanitize, wrap, money } = require('../public/js/pdf-export');

const EST = {
  line_items: [
    { label: 'Interior painting', description: '4 rooms × $300–$700 each', range_low: 1200, range_high: 2800 },
    { label: 'LVP flooring', description: 'Assumes 400 sq ft per room', range_low: 1600, range_high: 2400 }
  ],
  total_low: 2800,
  total_high: 5200,
  notes: 'Pricing assumes standard materials.',
  out_of_scope: ['HVAC replacement']
};

describe('pdf-export', () => {
  test('produces a structurally valid PDF', () => {
    const pdf = buildEstimatePdf(EST, { refId: 'FI-ABC234', projectName: '123 Main St', description: 'Turn 2 units', date: '11/13/2026' });
    expect(pdf.startsWith('%PDF-1.4')).toBe(true);
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(pdf).toContain('/Count 1');
    expect(pdf).toContain('Fishbeck Innovations');
    expect(pdf).toContain('FI-ABC234');
    expect(pdf).toContain('$2,800 - $5,200');
    expect(pdf).toContain('HVAC replacement');
  });

  test('xref offsets point at the objects they describe', () => {
    const pdf = buildEstimatePdf(EST, {});
    const xrefAt = Number(pdf.match(/startxref\n(\d+)/)[1]);
    expect(pdf.slice(xrefAt, xrefAt + 4)).toBe('xref');
    const entries = pdf.slice(xrefAt).match(/\d{10} 00000 n /g);
    entries.forEach((e, i) => {
      const off = Number(e.slice(0, 10));
      expect(pdf.slice(off, off + String(i + 1).length + 6)).toBe((i + 1) + ' 0 obj');
    });
  });

  test('stream /Length matches actual stream bytes', () => {
    const pdf = buildEstimatePdf(EST, {});
    const re = /\/Length (\d+) >>\nstream\n([\s\S]*?)\nendstream/g;
    let m, count = 0;
    while ((m = re.exec(pdf))) { expect(Number(m[1])).toBe(m[2].length); count++; }
    expect(count).toBeGreaterThan(0);
  });

  test('output is pure ASCII and escapes PDF special characters', () => {
    const pdf = buildEstimatePdf({ line_items: [{ label: 'A (B) \\ C', description: 'em—dash “quotes” …', range_low: 1, range_high: 2 }], total_low: 1, total_high: 2 }, {});
    expect(/^[\x00-\x7F]*$/.test(pdf)).toBe(true);
    expect(pdf).toContain('A \\(B\\) \\\\ C');
    expect(pdf).toContain('em-dash "quotes" ...');
  });

  test('paginates long estimates', () => {
    const items = Array.from({ length: 60 }, (_, i) => ({ label: 'Item ' + i, description: 'Some description text for line ' + i, range_low: 100, range_high: 200 }));
    const pdf = buildEstimatePdf({ line_items: items, total_low: 6000, total_high: 12000 }, {});
    const count = Number(pdf.match(/\/Count (\d+)/)[1]);
    expect(count).toBeGreaterThan(1);
    expect((pdf.match(/\/Type \/Page /g) || []).length).toBe(count);
  });

  test('handles empty / malformed estimates without throwing', () => {
    expect(() => buildEstimatePdf({}, {})).not.toThrow();
    expect(() => buildEstimatePdf(null, null)).not.toThrow();
    expect(() => buildEstimatePdf({ line_items: [{ range_low: 'x', range_high: undefined }] }, {})).not.toThrow();
  });

  test('helpers', () => {
    expect(money(1234567.4)).toBe('$1,234,567');
    expect(money('abc')).toBe('$0');
    expect(sanitize('a\nb\tc é')).toBe('a b c ?');
    expect(wrap('one two three four five six', 10, 60).length).toBeGreaterThan(1);
    expect(wrap('x'.repeat(200), 10, 100).every((l) => l.length <= 19)).toBe(true);
    expect(toBytes('AB')).toEqual(new Uint8Array([65, 66]));
  });
});
