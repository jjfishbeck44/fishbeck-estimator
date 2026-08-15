const fence = require('../public/js/calculators/fence-math');

test('100 ft fence, 8 ft spacing, 2 rails, 2 bags/post', () => {
  const r = fence.calculate({ lengthFt: 100, postSpacingFt: 8, railsPerSection: 2, concreteBagsPerPost: 2 });
  expect(r.sections).toBe(13);  // ceil(100/8)
  expect(r.posts).toBe(14);     // sections + 1
  expect(r.rails).toBe(26);
  expect(r.concreteBags).toBe(28);
});

test('zero length yields zero everything', () => {
  const r = fence.calculate({ lengthFt: 0 });
  expect(r.sections).toBe(0);
  expect(r.posts).toBe(0);
});

test('defaults applied for spacing/rails/bags', () => {
  const r = fence.calculate({ lengthFt: 80 });
  expect(r.postSpacingFt).toBe(fence.DEFAULT_SPACING_FT);
  expect(r.sections).toBe(10);
});
