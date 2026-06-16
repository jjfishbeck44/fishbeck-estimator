const salt = require('../public/js/calculators/salt-math');

test('10,000 sq ft lot, 12 lbs/1000, one application', () => {
  const r = salt.calculate({ areaSqFt: 10000, lbsPer1000: 12, bagLbs: 50, applications: 1 });
  expect(r.saltLbsPerApplication).toBeCloseTo(120, 6);
  expect(r.saltLbs).toBeCloseTo(120, 6);
  expect(r.bags).toBe(3); // ceil(120 / 50)
});

test('multiple applications scale the total', () => {
  const r = salt.calculate({ areaSqFt: 10000, lbsPer1000: 12, bagLbs: 50, applications: 5 });
  expect(r.saltLbs).toBeCloseTo(600, 6);
  expect(r.bags).toBe(12);
});

test('empty options do not throw', () => {
  expect(salt.calculate({}).bags).toBe(0);
});
