const concrete = require('../public/js/calculators/concrete-math');

test('100 sq ft slab at 4" with 10% waste, 80lb bags', () => {
  const r = concrete.calculate({ areaSqFt: 100, thicknessIn: 4, wastePct: 10, bagSizeLb: 80 });
  expect(r.cubicFeet).toBeCloseTo(36.6667, 3);   // 33.33 * 1.10
  expect(r.cubicYards).toBeCloseTo(1.358, 3);
  expect(r.cubicYardsRounded).toBe(1.4);
  expect(r.bags).toBe(62);                        // ceil(36.667 / 0.60)
});

test('60lb bags yield fewer cu ft so need more bags', () => {
  const r = concrete.calculate({ areaSqFt: 100, thicknessIn: 4, wastePct: 0, bagSizeLb: 60 });
  expect(r.bags).toBe(Math.ceil((100 * (4 / 12)) / 0.45)); // 75
});

test('default thickness and empty options', () => {
  expect(concrete.calculate({ areaSqFt: 100 }).thicknessIn).toBe(concrete.DEFAULT_THICKNESS_IN);
  expect(concrete.calculate({}).bags).toBe(0);
});
