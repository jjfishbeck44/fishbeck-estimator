// tests/workOrderPrompt.test.js
const { buildWorkOrderPrompt } = require('../lib/workOrderPrompt');

describe('buildWorkOrderPrompt()', () => {
  test('returns a non-empty string', () => {
    expect(typeof buildWorkOrderPrompt()).toBe('string');
    expect(buildWorkOrderPrompt().length).toBeGreaterThan(0);
  });

  test('contains required JSON schema fields', () => {
    const p = buildWorkOrderPrompt();
    expect(p).toMatch(/work_order_number/);
    expect(p).toMatch(/clearance_sourceable/);
    expect(p).toMatch(/pre_arrival_checklist/);
    expect(p).toMatch(/material_budget/);
    expect(p).toMatch(/total_hours/);
    expect(p).toMatch(/flags/);
    expect(p).toMatch(/out_of_scope/);
  });

  test('mentions clearance sourcing concept', () => {
    expect(buildWorkOrderPrompt()).toMatch(/clearance/i);
  });

  test('is deterministic across calls', () => {
    expect(buildWorkOrderPrompt()).toBe(buildWorkOrderPrompt());
  });
});
