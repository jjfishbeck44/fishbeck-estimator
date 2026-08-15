const pavers = require('../public/js/calculators/pavers-math');

test('100 sq ft patio, 8x4 pavers, 5% waste', () => {
  const r = pavers.calculate({ areaSqFt: 100, wastePct: 5, paverLengthIn: 8, paverWidthIn: 4, baseDepthIn: 4, sandDepthIn: 1 });
  expect(r.paverSqFt).toBeCloseTo(0.2222, 4); // 32 / 144
  expect(r.pavers).toBe(473);                 // ceil(105 / 0.2222)
  expect(r.baseCuYd).toBe(1.3);               // ceil(1.2345 * 10)/10
  expect(r.sandCuYd).toBe(0.4);               // ceil(0.3086 * 10)/10
});

test('defaults and empty options', () => {
  const r = pavers.calculate({ areaSqFt: 100 });
  expect(r.paverSqFt).toBeCloseTo((pavers.DEFAULT_PAVER_L_IN * pavers.DEFAULT_PAVER_W_IN) / 144, 4);
  expect(pavers.calculate({}).pavers).toBe(0);
});
