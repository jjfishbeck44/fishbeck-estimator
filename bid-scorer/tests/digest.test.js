// bid-scorer/tests/digest.test.js
const {
  renderDigest,
  renderTextDigest,
  renderHtmlDigest,
  sortScored,
  summaryCounts
} = require('../lib/digest');

const sampleScored = [
  {
    title: 'MnDOT Highway Maintenance Facility Repainting',
    agency: 'MnDOT',
    deadline_iso: '2026-07-15',
    estimated_value_low: 185000,
    estimated_value_high: 185000,
    spec_flexibility: 1,
    spec_flexibility_reasoning: 'Hard SKU lockdown',
    trade_fit: 7,
    trade_fit_reasoning: 'Exterior paint adjacent',
    bid_friendliness: 4,
    bid_friendliness_reasoning: 'Bond required, prevailing wage',
    out_of_scope_flags: ['Electrical', 'Concrete'],
    recommendation: 'skip',
    recommendation_one_liner: 'MnDOT exterior repaint, $185k, Sherwin-Williams lockdown — kills clearance edge.'
  },
  {
    title: 'MPHA Unit Turn 14 Scattered Sites',
    agency: 'Minneapolis Public Housing Authority',
    deadline_iso: '2026-06-28',
    estimated_value_low: 38000,
    estimated_value_high: 52000,
    spec_flexibility: 9,
    spec_flexibility_reasoning: 'Contractor choice paint, or-equal LVP',
    trade_fit: 10,
    trade_fit_reasoning: 'Pure unit turn',
    bid_friendliness: 9,
    bid_friendliness_reasoning: 'No bond, no prevailing wage, $38-52k',
    out_of_scope_flags: [],
    recommendation: 'bid',
    recommendation_one_liner: 'MPHA 14-unit scattered-site turn, $38-52k, no bond, flexible specs — strong fit.'
  },
  {
    title: 'SPPS Roosevelt Elementary Summer Repaint',
    agency: 'Saint Paul Public Schools',
    deadline_iso: '2026-07-01',
    estimated_value_low: 28000,
    estimated_value_high: 42000,
    spec_flexibility: 8,
    spec_flexibility_reasoning: 'Or-equal on paint, contractor choice on trim',
    trade_fit: 9,
    trade_fit_reasoning: 'Interior paint core wheelhouse',
    bid_friendliness: 6,
    bid_friendliness_reasoning: 'Prevailing wage applies; size manageable',
    out_of_scope_flags: [],
    recommendation: 'review',
    recommendation_one_liner: 'SPPS Roosevelt summer repaint, $28-42k, flexible specs but prevailing wage — worth a look.'
  }
];

describe('sortScored()', () => {
  test('puts bid first, then review, then skip', () => {
    const sorted = sortScored(sampleScored);
    expect(sorted.map((s) => s.recommendation)).toEqual(['bid', 'review', 'skip']);
  });

  test('within same verdict, sorts by trade_fit desc', () => {
    const sorted = sortScored([
      { recommendation: 'bid', trade_fit: 7, bid_friendliness: 9, title: 'A' },
      { recommendation: 'bid', trade_fit: 10, bid_friendliness: 5, title: 'B' }
    ]);
    expect(sorted[0].title).toBe('B');
  });

  test('does not mutate input array', () => {
    const original = [...sampleScored];
    sortScored(sampleScored);
    expect(sampleScored).toEqual(original);
  });
});

describe('summaryCounts()', () => {
  test('counts each verdict', () => {
    expect(summaryCounts(sampleScored)).toEqual({ bid: 1, review: 1, skip: 1 });
  });

  test('ignores unknown verdicts', () => {
    expect(summaryCounts([{ recommendation: 'maybe' }, { recommendation: 'bid' }]))
      .toEqual({ bid: 1, review: 0, skip: 0 });
  });
});

describe('renderTextDigest()', () => {
  test('contains date, summary line, and each non-skip title', () => {
    const text = renderTextDigest(sampleScored, { date: '2026-06-14' });
    expect(text).toMatch(/FISHBECK BID DIGEST — 2026-06-14/);
    expect(text).toMatch(/1 BID · 1 REVIEW · 1 SKIP/);
    expect(text).toMatch(/MPHA Unit Turn/);
    expect(text).toMatch(/SPPS Roosevelt/);
  });

  test('puts skipped items in their own section', () => {
    const text = renderTextDigest(sampleScored, { date: '2026-06-14' });
    expect(text).toMatch(/Skipped \(low score\)/);
    expect(text).toMatch(/MnDOT Highway/);
  });

  test('shows scores and value range', () => {
    const text = renderTextDigest(sampleScored, { date: '2026-06-14' });
    expect(text).toMatch(/\$38,000 – \$52,000/);
    expect(text).toMatch(/spec 9\/10/);
    expect(text).toMatch(/trade 10\/10/);
  });

  test('handles empty input', () => {
    const text = renderTextDigest([], { date: '2026-06-14' });
    expect(text).toMatch(/0 BID · 0 REVIEW · 0 SKIP/);
  });

  test('renders out-of-scope flags when present', () => {
    const text = renderTextDigest([
      {
        ...sampleScored[0],
        recommendation: 'review',
        out_of_scope_flags: ['Electrical', 'Concrete']
      }
    ], { date: '2026-06-14' });
    expect(text).toMatch(/OOS:\s+Electrical, Concrete/);
  });
});

describe('renderHtmlDigest()', () => {
  test('returns valid-looking HTML', () => {
    const html = renderHtmlDigest(sampleScored, { date: '2026-06-14' });
    expect(html).toMatch(/<!DOCTYPE html>/);
    expect(html).toMatch(/Fishbeck Bid Digest/);
    expect(html).toMatch(/2026-06-14/);
  });

  test('escapes HTML in titles', () => {
    const malicious = [{
      ...sampleScored[1],
      title: '<script>alert(1)</script>'
    }];
    const html = renderHtmlDigest(malicious);
    expect(html).not.toMatch(/<script>alert\(1\)<\/script>/);
    expect(html).toMatch(/&lt;script&gt;/);
  });

  test('includes verdict badges for bid and review', () => {
    const html = renderHtmlDigest(sampleScored);
    expect(html).toMatch(/>BID</);
    expect(html).toMatch(/>REVIEW</);
  });

  test('groups skipped items separately', () => {
    const html = renderHtmlDigest(sampleScored);
    expect(html).toMatch(/Skipped \(1\)/);
  });

  test('shows empty-state copy when no actionable bids', () => {
    const html = renderHtmlDigest([{ ...sampleScored[0] }]);
    expect(html).toMatch(/No actionable bids today/);
  });
});

describe('renderDigest()', () => {
  test('returns both text and html plus counts', () => {
    const d = renderDigest(sampleScored, { date: '2026-06-14' });
    expect(d.text).toMatch(/FISHBECK BID DIGEST/);
    expect(d.html).toMatch(/<!DOCTYPE html>/);
    expect(d.counts).toEqual({ bid: 1, review: 1, skip: 1 });
  });
});
