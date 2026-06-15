// public/js/calculators/mulch-math.js
// Pure mulch / bulk-material math — no DOM, no I/O.
// UMD-style guard: usable as a CommonJS module (Jest) and as a browser
// global (window.FCalc.mulch). This is the template every calculator's
// math module follows so the logic can be unit-tested without a build step.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FCalc = root.FCalc || {};
    root.FCalc.mulch = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 1 cubic yard of material covers 324 sq ft at 1 inch deep (27 cu ft / 0.0833 ft).
  var SQFT_PER_CUYD_PER_INCH = 324;
  var DEFAULT_DEPTH_IN = 3;        // 3" is the typical mulch depth for beds
  var DEFAULT_BAG_CUFT = 2;        // bagged mulch is commonly 2 cu ft per bag

  // Coerce a value to a positive number, or 0 if invalid/non-positive.
  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // Square footage from a rectangle (length x width, both in feet).
  function areaFromRectangle(lengthFt, widthFt) {
    return toPositive(lengthFt) * toPositive(widthFt);
  }

  // Loose cubic feet of material for an area at a given depth.
  function cubicFeet(areaSqFt, depthInches) {
    return toPositive(areaSqFt) * (toPositive(depthInches) / 12);
  }

  // Bulk material volume in cubic yards.
  function cubicYards(areaSqFt, depthInches) {
    return (toPositive(areaSqFt) * toPositive(depthInches)) / SQFT_PER_CUYD_PER_INCH;
  }

  // Number of bags needed for the area at the given depth and bag size.
  function bags(areaSqFt, depthInches, bagCuFt) {
    var size = toPositive(bagCuFt);
    if (!size) return 0;
    return cubicFeet(areaSqFt, depthInches) / size;
  }

  // Convenience: full result set for the calculator UI.
  // opts: { areaSqFt, depthInches, bagCuFt }
  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var depth = toPositive(opts.depthInches) || DEFAULT_DEPTH_IN;
    var bagSize = toPositive(opts.bagCuFt) || DEFAULT_BAG_CUFT;

    var cuYds = cubicYards(area, depth);
    var bagCount = bags(area, depth, bagSize);

    return {
      areaSqFt: area,
      depthInches: depth,
      bagCuFt: bagSize,
      cubicFeet: cubicFeet(area, depth),
      cubicYards: cuYds,
      cubicYardsRounded: Math.ceil(cuYds * 10) / 10, // 1 decimal, rounded up
      bulkYardsToOrder: Math.ceil(cuYds),            // suppliers sell whole yards
      bags: bagCount,
      bagsToOrder: Math.ceil(bagCount)
    };
  }

  return {
    SQFT_PER_CUYD_PER_INCH: SQFT_PER_CUYD_PER_INCH,
    DEFAULT_DEPTH_IN: DEFAULT_DEPTH_IN,
    DEFAULT_BAG_CUFT: DEFAULT_BAG_CUFT,
    toPositive: toPositive,
    areaFromRectangle: areaFromRectangle,
    cubicFeet: cubicFeet,
    cubicYards: cubicYards,
    bags: bags,
    calculate: calculate
  };
});
