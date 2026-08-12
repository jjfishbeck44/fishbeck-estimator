const baseboard = require('../public/js/calculators/baseboard-math');

test('12x12 room, 1 door, 10% waste, 12 ft sticks', () => {
  const r = baseboard.calculate({ lengthFt: 12, widthFt: 12, doors: 1, wastePct: 10, stockFt: 12 });
  expect(r.perimeterFt).toBe(48);
  expect(r.netFeet).toBe(45);           // 48 - 1*3
  expect(r.feetWithWaste).toBeCloseTo(49.5, 6);
  expect(r.pieces).toBe(5);             // ceil(49.5 / 12)
});

test('direct perimeter overrides L x W', () => {
  const r = baseboard.calculate({ perimeterFt: 60, doors: 0, wastePct: 0, stockFt: 12 });
  expect(r.netFeet).toBe(60);
  expect(r.pieces).toBe(5);
});

test('doors wider than the room never go negative', () => {
  const r = baseboard.calculate({ perimeterFt: 5, doors: 3 });
  expect(r.netFeet).toBe(0);
  expect(r.pieces).toBe(0);
});
