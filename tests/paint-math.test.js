// tests/paint-math.test.js
// Unit tests for the pure paint math module (Jest node env, no DOM/mocks).

const paint = require('../public/js/calculators/paint-math');

describe('paint math — wallAreaFromRoom', () => {
  test('12 x 12 room, 8 ft ceiling = 384 sq ft of wall', () => {
    expect(paint.wallAreaFromRoom(12, 12, 8)).toBe(384);
  });

  test('zero or negative height yields 0', () => {
    expect(paint.wallAreaFromRoom(12, 12, 0)).toBe(0);
    expect(paint.wallAreaFromRoom(12, 12, -8)).toBe(0);
  });
});

describe('paint math — paintableArea', () => {
  test('subtracts 21 sq ft per door and 15 per window', () => {
    // 384 - 1*21 - 2*15 = 333
    expect(paint.paintableArea(384, 1, 2)).toBe(333);
  });

  test('never goes below zero', () => {
    expect(paint.paintableArea(20, 5, 5)).toBe(0);
  });

  test('non-numeric counts treated as zero', () => {
    expect(paint.paintableArea(384, 'x', null)).toBe(384);
  });
});

describe('paint math — gallons', () => {
  test('333 sq ft, 2 coats, 350 coverage ≈ 1.90 gallons', () => {
    expect(paint.gallons(333, 2, 350)).toBeCloseTo(1.9029, 3);
  });

  test('defaults: missing coats -> 2, missing coverage -> 350', () => {
    expect(paint.gallons(350, 0, 0)).toBeCloseTo(2.0, 6);
  });
});

describe('paint math — calculate', () => {
  test('rounds up to whole gallons and applies deductions', () => {
    const r = paint.calculate({ wallAreaSqFt: 384, doors: 1, windows: 2, coats: 2, coveragePerGallon: 350 });
    expect(r.paintableArea).toBe(333);
    expect(r.coats).toBe(2);
    expect(r.gallons).toBeCloseTo(1.9029, 3);
    expect(r.gallonsRounded).toBe(2.0); // ceil(1.90) to 0.1 = 2.0
    expect(r.gallonsToBuy).toBe(2);     // ceil(1.90)
  });

  test('applies default coats and coverage when omitted', () => {
    const r = paint.calculate({ wallAreaSqFt: 350, doors: 0, windows: 0 });
    expect(r.coats).toBe(paint.DEFAULT_COATS);
    expect(r.coveragePerGallon).toBe(paint.COVERAGE_SQFT_PER_GALLON);
    expect(r.gallonsToBuy).toBe(2);
  });

  test('empty options do not throw and yield zero gallons', () => {
    const r = paint.calculate({});
    expect(r.paintableArea).toBe(0);
    expect(r.gallons).toBe(0);
    expect(r.gallonsToBuy).toBe(0);
  });
});
