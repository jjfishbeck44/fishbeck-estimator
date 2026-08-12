// public/js/calculators/concrete-math.js
// Pure concrete-volume math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.concrete = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_THICKNESS_IN = 4;  // typical slab/patio thickness
  var DEFAULT_WASTE_PCT = 10;    // allow for spillage / uneven subgrade
  var CUFT_PER_CUYD = 27;
  // Yield of mixed concrete per pre-mix bag (cubic feet).
  var BAG_YIELD_CUFT = { 40: 0.30, 60: 0.45, 80: 0.60 };

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toPercent(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  // Loose volume (cu ft) for a slab of given area and thickness, before waste.
  function cubicFeet(areaSqFt, thicknessIn) {
    return toPositive(areaSqFt) * (toPositive(thicknessIn) / 12);
  }

  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var thickness = toPositive(opts.thicknessIn) || DEFAULT_THICKNESS_IN;
    var wastePct = toPercent(opts.wastePct);
    var bagSize = toPositive(opts.bagSizeLb) || 80;
    var yield_ = BAG_YIELD_CUFT[bagSize] || BAG_YIELD_CUFT[80];

    var rawCuFt = cubicFeet(area, thickness);
    var cuFt = rawCuFt * (1 + wastePct / 100);

    return {
      areaSqFt: area,
      thicknessIn: thickness,
      wastePct: wastePct,
      bagSizeLb: bagSize,
      cubicFeet: cuFt,
      cubicYards: cuFt / CUFT_PER_CUYD,
      cubicYardsRounded: Math.ceil((cuFt / CUFT_PER_CUYD) * 10) / 10,
      bags: area > 0 ? Math.ceil(cuFt / yield_ - 1e-9) : 0
    };
  }

  return {
    DEFAULT_THICKNESS_IN: DEFAULT_THICKNESS_IN,
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    CUFT_PER_CUYD: CUFT_PER_CUYD,
    BAG_YIELD_CUFT: BAG_YIELD_CUFT,
    toPositive: toPositive,
    toPercent: toPercent,
    cubicFeet: cubicFeet,
    calculate: calculate
  };
});
