// tests/mulch-math.test.js
// Unit tests for the pure mulch math module. Runs in Jest's node env via the
// module's UMD guard — no DOM, no mocks.

const mulch = require('../public/js/calculators/mulch-math');

describe('mulch math — cubicYards', () => {
  test('324 sq ft at 1 inch deep = 1 cubic yard', () => {
    expect(mulch.cubicYards(324, 1)).toBeCloseTo(1.0, 6);
  });

  test('800 sq ft at 3 inches deep ≈ 7.41 cubic yards', () => {
    expect(mulch.cubicYards(800, 3)).toBeCloseTo(7.4074, 3);
  });

  test('non-positive inputs yield 0', () => {
    expect(mulch.cubicYards(0, 3)).toBe(0);
    expect(mulch.cubicYards(-100, 3)).toBe(0);
    expect(mulch.cubicYards(100, 0)).toBe(0);
    expect(mulch.cubicYards('abc', 3)).toBe(0);
  });
});

describe('mulch math — cubicFeet & bags', () => {
  test('800 sq ft at 3 inches = 200 cubic feet', () => {
    expect(mulch.cubicFeet(800, 3)).toBeCloseTo(200, 6);
  });

  test('200 cubic feet in 2 cu ft bags = 100 bags', () => {
    expect(mulch.bags(800, 3, 2)).toBeCloseTo(100, 6);
  });

  test('zero or missing bag size yields 0 bags (no divide by zero)', () => {
    expect(mulch.bags(800, 3, 0)).toBe(0);
    expect(mulch.bags(800, 3)).toBe(0);
  });
});

describe('mulch math — areaFromRectangle', () => {
  test('40 ft x 20 ft = 800 sq ft', () => {
    expect(mulch.areaFromRectangle(40, 20)).toBe(800);
  });

  test('negative or non-numeric dimensions yield 0', () => {
    expect(mulch.areaFromRectangle(-40, 20)).toBe(0);
    expect(mulch.areaFromRectangle(40, 'x')).toBe(0);
  });
});

describe('mulch math — calculate', () => {
  test('rounds bulk yards and bags up, applies defaults', () => {
    const r = mulch.calculate({ areaSqFt: 800, depthInches: 3 });
    expect(r.depthInches).toBe(3);
    expect(r.bagCuFt).toBe(mulch.DEFAULT_BAG_CUFT);
    expect(r.cubicYards).toBeCloseTo(7.4074, 3);
    expect(r.bulkYardsToOrder).toBe(8); // ceil(7.41)
    expect(r.cubicYardsRounded).toBe(7.5); // ceil to 0.1
    expect(r.bagsToOrder).toBe(100);
  });

  test('falls back to default depth when depth omitted', () => {
    const r = mulch.calculate({ areaSqFt: 324 });
    expect(r.depthInches).toBe(mulch.DEFAULT_DEPTH_IN);
  });

  test('empty options do not throw and produce zeroed volume', () => {
    const r = mulch.calculate({});
    expect(r.areaSqFt).toBe(0);
    expect(r.cubicYards).toBe(0);
    expect(r.bulkYardsToOrder).toBe(0);
  });
});
