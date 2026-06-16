// tests/drywall-math.test.js
// Unit tests for the pure drywall math module (Jest node env, no DOM/mocks).

const drywall = require('../public/js/calculators/drywall-math');

describe('drywall math — area helpers', () => {
  test('wallArea: 12 x 12 room, 8 ft ceiling = 384 sq ft', () => {
    expect(drywall.wallArea(12, 12, 8)).toBe(384);
  });

  test('ceilingArea: 12 x 12 = 144 sq ft', () => {
    expect(drywall.ceilingArea(12, 12)).toBe(144);
  });
});

describe('drywall math — sheets', () => {
  test('528 sq ft, 4x8 sheets, 10% waste = 19 sheets', () => {
    // ceil(528 * 1.1 / 32) = ceil(18.15) = 19
    expect(drywall.sheets(528, 32, 10)).toBe(19);
  });

  test('zero area = 0 sheets', () => {
    expect(drywall.sheets(0, 32, 10)).toBe(0);
  });

  test('default sheet size used when omitted', () => {
    expect(drywall.sheets(528, 0, 10)).toBe(19);
  });

  test('negative waste treated as 0', () => {
    // ceil(320 / 32) = 10
    expect(drywall.sheets(320, 32, -5)).toBe(10);
  });
});

describe('drywall math — calculate', () => {
  test('full result for a 528 sq ft job (4x8, 10% waste)', () => {
    const r = drywall.calculate({ areaSqFt: 528, sheetSqFt: 32, wastePct: 10 });
    expect(r.sheets).toBe(19);
    expect(r.screws).toBe(19 * drywall.SCREWS_PER_SHEET); // 608
    expect(r.compoundGallons).toBeCloseTo(4.9, 6); // ceil(4.888 * 10) / 10
    expect(r.tapeFeet).toBe(196); // ceil(528 * 0.37)
  });

  test('larger 4x12 sheets reduce the count', () => {
    const r = drywall.calculate({ areaSqFt: 528, sheetSqFt: 48, wastePct: 10 });
    expect(r.sheets).toBe(Math.ceil((528 * 1.1) / 48)); // 13
    expect(r.sheetSqFt).toBe(48);
  });

  test('empty options do not throw and yield zeros', () => {
    const r = drywall.calculate({});
    expect(r.areaSqFt).toBe(0);
    expect(r.sheets).toBe(0);
    expect(r.screws).toBe(0);
    expect(r.tapeFeet).toBe(0);
  });
});
