// public/js/calculators/pavers-math.js
// Pure paver-patio math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.pavers = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_WASTE_PCT = 5;    // cuts and breakage
  var DEFAULT_PAVER_L_IN = 8;   // common 8" x 4" brick paver
  var DEFAULT_PAVER_W_IN = 4;
  var DEFAULT_BASE_DEPTH_IN = 4; // compacted gravel base
  var DEFAULT_SAND_DEPTH_IN = 1; // bedding sand
  var SQIN_PER_SQFT = 144;
  var CUFT_PER_CUYD = 27;

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toPercent(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  function paverSqFt(lengthIn, widthIn) {
    return (toPositive(lengthIn) * toPositive(widthIn)) / SQIN_PER_SQFT;
  }

  // Cubic yards of a layer of given depth (inches) under an area.
  function layerCuYd(areaSqFt, depthIn) {
    return (toPositive(areaSqFt) * (toPositive(depthIn) / 12)) / CUFT_PER_CUYD;
  }

  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var wastePct = toPercent(opts.wastePct);
    var perPaver = paverSqFt(
      toPositive(opts.paverLengthIn) || DEFAULT_PAVER_L_IN,
      toPositive(opts.paverWidthIn) || DEFAULT_PAVER_W_IN
    );
    var baseDepth = toPositive(opts.baseDepthIn) || DEFAULT_BASE_DEPTH_IN;
    var sandDepth = toPositive(opts.sandDepthIn) || DEFAULT_SAND_DEPTH_IN;

    return {
      areaSqFt: area,
      wastePct: wastePct,
      paverSqFt: perPaver,
      pavers: (area > 0 && perPaver > 0) ? Math.ceil((area * (1 + wastePct / 100)) / perPaver - 1e-9) : 0,
      baseCuYd: Math.ceil(layerCuYd(area, baseDepth) * 10) / 10,
      sandCuYd: Math.ceil(layerCuYd(area, sandDepth) * 10) / 10
    };
  }

  return {
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    DEFAULT_PAVER_L_IN: DEFAULT_PAVER_L_IN,
    DEFAULT_PAVER_W_IN: DEFAULT_PAVER_W_IN,
    DEFAULT_BASE_DEPTH_IN: DEFAULT_BASE_DEPTH_IN,
    DEFAULT_SAND_DEPTH_IN: DEFAULT_SAND_DEPTH_IN,
    toPositive: toPositive,
    toPercent: toPercent,
    paverSqFt: paverSqFt,
    layerCuYd: layerCuYd,
    calculate: calculate
  };
});
