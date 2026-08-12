// public/js/calculators/flooring-math.js
// Pure flooring-quantity math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.flooring = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_WASTE_PCT = 10;  // typical cutting waste for plank/tile flooring
  var DEFAULT_BOX_SQFT = 20;   // common coverage per carton

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toPercent(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  function areaFromRectangle(lengthFt, widthFt) {
    return toPositive(lengthFt) * toPositive(widthFt);
  }
  function areaWithWaste(areaSqFt, wastePct) {
    return toPositive(areaSqFt) * (1 + toPercent(wastePct) / 100);
  }
  function boxes(areaSqFt, wastePct, boxSqFt) {
    var box = toPositive(boxSqFt) || DEFAULT_BOX_SQFT;
    var area = toPositive(areaSqFt);
    if (area <= 0) return 0;
    // Subtract a tiny epsilon so float noise (e.g. 220.0000000003) doesn't bump the count.
    return Math.ceil(areaWithWaste(area, wastePct) / box - 1e-9);
  }

  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var wastePct = toPercent(opts.wastePct);
    var boxSqFt = toPositive(opts.boxSqFt) || DEFAULT_BOX_SQFT;
    return {
      areaSqFt: area,
      wastePct: wastePct,
      boxSqFt: boxSqFt,
      areaWithWaste: areaWithWaste(area, wastePct),
      boxes: boxes(area, wastePct, boxSqFt)
    };
  }

  return {
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    DEFAULT_BOX_SQFT: DEFAULT_BOX_SQFT,
    toPositive: toPositive,
    toPercent: toPercent,
    areaFromRectangle: areaFromRectangle,
    areaWithWaste: areaWithWaste,
    boxes: boxes,
    calculate: calculate
  };
});
