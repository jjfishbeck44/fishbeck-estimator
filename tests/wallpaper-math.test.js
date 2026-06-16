const wallpaper = require('../public/js/calculators/wallpaper-math');

test('384 sq ft walls, 1 door, 2 windows, 15% waste, 28 sq ft rolls', () => {
  const r = wallpaper.calculate({ wallAreaSqFt: 384, doors: 1, windows: 2, wastePct: 15, rollSqFt: 28 });
  expect(r.netArea).toBe(333);   // 384 - 21 - 30
  expect(r.rolls).toBe(14);      // ceil(333 * 1.15 / 28)
});

test('deductions never exceed wall area', () => {
  const r = wallpaper.calculate({ wallAreaSqFt: 20, doors: 5, windows: 5 });
  expect(r.netArea).toBe(0);
  expect(r.rolls).toBe(0);
});
