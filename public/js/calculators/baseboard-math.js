// public/js/calculators/baseboard-math.js
// Pure baseboard/trim math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.baseboard = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_WASTE_PCT = 10;   // miter cuts and offcuts
  var DOOR_WIDTH_FT = 3;        // standard doorway opening (no baseboard)
  var DEFAULT_STOCK_FT = 12;    // common trim stick length

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toPercent(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : 0;
  }
  function toCount(value) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    return isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  function perimeter(lengthFt, widthFt) {
    return 2 * (toPositive(lengthFt) + toPositive(widthFt));
  }

  function calculate(opts) {
    opts = opts || {};
    // Use a directly-supplied perimeter if given, else derive from L x W.
    var perim = toPositive(opts.perimeterFt) || perimeter(opts.lengthFt, opts.widthFt);
    var doors = toCount(opts.doors);
    var wastePct = toPercent(opts.wastePct);
    var stockFt = toPositive(opts.stockFt) || DEFAULT_STOCK_FT;

    var net = perim - doors * DOOR_WIDTH_FT;
    if (net < 0) net = 0;
    var withWaste = net * (1 + wastePct / 100);

    return {
      perimeterFt: perim,
      doors: doors,
      wastePct: wastePct,
      stockFt: stockFt,
      netFeet: net,
      feetWithWaste: withWaste,
      pieces: net > 0 ? Math.ceil(withWaste / stockFt) : 0
    };
  }

  return {
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    DOOR_WIDTH_FT: DOOR_WIDTH_FT,
    DEFAULT_STOCK_FT: DEFAULT_STOCK_FT,
    toPositive: toPositive,
    toPercent: toPercent,
    toCount: toCount,
    perimeter: perimeter,
    calculate: calculate
  };
});
