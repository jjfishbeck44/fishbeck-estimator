const roomArea = require('../public/js/calculators/room-area-math');

test('rectangleArea multiplies length by width', () => {
  expect(roomArea.rectangleArea(12, 12)).toBe(144);
});

test('totalArea sums multiple rooms', () => {
  const total = roomArea.totalArea([
    { lengthFt: 12, widthFt: 12 },
    { lengthFt: 10, widthFt: 8 }
  ]);
  expect(total).toBe(224);
});

test('ignores invalid rows and non-arrays', () => {
  expect(roomArea.totalArea([{ lengthFt: 10, widthFt: 0 }, { lengthFt: 'x', widthFt: 5 }])).toBe(0);
  expect(roomArea.totalArea(null)).toBe(0);
});
