// public/js/calculators/sod-math.js
// Pure sod-quantity math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.sod = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_WASTE_PCT = 5;   // trimming around edges
  var ROLL_SQFT = 10;          // a standard 2' x 5' sod roll
  var PALLET_SQFT = 450;       // typical pallet coverage

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

  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var wastePct = toPercent(opts.wastePct);
    var rollSqFt = toPositive(opts.rollSqFt) || ROLL_SQFT;
    var palletSqFt = toPositive(opts.palletSqFt) || PALLET_SQFT;
    var withWaste = area * (1 + wastePct / 100);

    return {
      areaSqFt: area,
      wastePct: wastePct,
      areaWithWaste: withWaste,
      rolls: area > 0 ? Math.ceil(withWaste / rollSqFt - 1e-9) : 0,
      pallets: area > 0 ? Math.ceil(withWaste / palletSqFt - 1e-9) : 0
    };
  }

  return {
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    ROLL_SQFT: ROLL_SQFT,
    PALLET_SQFT: PALLET_SQFT,
    toPositive: toPositive,
    toPercent: toPercent,
    areaFromRectangle: areaFromRectangle,
    calculate: calculate
  };
});
