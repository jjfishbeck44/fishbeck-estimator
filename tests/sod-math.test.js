const sod = require('../public/js/calculators/sod-math');

test('1000 sq ft, 5% waste', () => {
  const r = sod.calculate({ areaSqFt: 1000, wastePct: 5 });
  expect(r.areaWithWaste).toBeCloseTo(1050, 6);
  expect(r.rolls).toBe(105);   // ceil(1050 / 10)
  expect(r.pallets).toBe(3);   // ceil(1050 / 450)
});

test('zero area and empty options', () => {
  expect(sod.calculate({ areaSqFt: 0 }).rolls).toBe(0);
  expect(sod.calculate({}).pallets).toBe(0);
});
