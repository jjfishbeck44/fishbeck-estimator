const flooring = require('../public/js/calculators/flooring-math');

test('200 sq ft, 10% waste, 20 sq ft boxes = 11 boxes', () => {
  const r = flooring.calculate({ areaSqFt: 200, wastePct: 10, boxSqFt: 20 });
  expect(r.areaWithWaste).toBeCloseTo(220, 6);
  expect(r.boxes).toBe(11);
});

test('defaults apply when omitted', () => {
  const r = flooring.calculate({ areaSqFt: 200 });
  expect(r.boxSqFt).toBe(flooring.DEFAULT_BOX_SQFT);
});

test('zero area = 0 boxes, no throw on empty', () => {
  expect(flooring.calculate({ areaSqFt: 0 }).boxes).toBe(0);
  expect(flooring.calculate({}).boxes).toBe(0);
});
