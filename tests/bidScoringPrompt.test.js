// tests/bidScoringPrompt.test.js
const { buildBidScoringPrompt } = require('../lib/bidScoringPrompt');

describe('buildBidScoringPrompt()', () => {
  test('returns a non-empty string', () => {
    expect(typeof buildBidScoringPrompt()).toBe('string');
    expect(buildBidScoringPrompt().length).toBeGreaterThan(0);
  });

  test('is deterministic', () => {
    expect(buildBidScoringPrompt()).toBe(buildBidScoringPrompt());
  });

  test('contains the three scoring dimensions', () => {
    const p = buildBidScoringPrompt();
    expect(p).toMatch(/spec_flexibility/);
    expect(p).toMatch(/trade_fit/);
    expect(p).toMatch(/bid_friendliness/);
  });

  test('contains recommendation values', () => {
    const p = buildBidScoringPrompt();
    expect(p).toMatch(/"bid"/);
    expect(p).toMatch(/"review"/);
    expect(p).toMatch(/"skip"/);
  });

  test('references clearance sourcing', () => {
    expect(buildBidScoringPrompt()).toMatch(/clearance/i);
  });

  test('includes JSON schema fields', () => {
    const p = buildBidScoringPrompt();
    expect(p).toMatch(/recommendation_one_liner/);
    expect(p).toMatch(/out_of_scope_items/);
    expect(p).toMatch(/flags/);
  });
});
