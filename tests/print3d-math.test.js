const print3d = require('../public/js/calculators/print3d-math');
const pricing = require('../public/js/calculators/pricing');

test('single-color estimate with grams + hours', () => {
  const r = print3d.calculate({ quantity: 1, colors: 1, grams: 50, hours: 3, ship: false });
  const P = pricing.print3d;
  const matTime = (50 * P.perGram + 3 * P.perPrintHour) * 1.0;
  expect(r.total).toBe(Math.round(P.baseFee + P.perItemSetup + matTime));
  expect(r.multiplier).toBe(1.0);
  expect(r.shipping).toBe(0);
});

test('multicolor raises cost and shipping adds the fee', () => {
  const single = print3d.calculate({ quantity: 2, colors: 1, grams: 50, hours: 3, ship: true });
  const multi = print3d.calculate({ quantity: 2, colors: 4, grams: 50, hours: 3, ship: true });
  expect(multi.total).toBeGreaterThan(single.total);
  expect(single.shipping).toBe(pricing.print3d.shippingFee);
});

test('colors clamp to 1..4 and quantity floors at 1', () => {
  expect(print3d.calculate({ colors: 9 }).colors).toBe(4);
  expect(print3d.calculate({ colors: 0 }).colors).toBe(1);
  expect(print3d.calculate({ quantity: 0 }).quantity).toBe(1);
});
