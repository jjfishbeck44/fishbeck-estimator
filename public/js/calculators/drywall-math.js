// public/js/calculators/drywall-math.js
// Pure drywall-quantity math — no DOM, no I/O.
// UMD guard: browser global (window.FCalc.drywall) + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FCalc = root.FCalc || {};
    root.FCalc.drywall = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_SHEET_SQFT = 32;     // a 4' x 8' sheet
  var DEFAULT_WASTE_PCT = 10;      // typical cutting/waste allowance
  var SCREWS_PER_SHEET = 32;       // ~32 screws per 4x8 sheet at 16" o.c.
  var COMPOUND_SQFT_PER_GALLON = 108; // ~4.5 gal box finishes ~485 sq ft (tape + 3 coats)
  var TAPE_FT_PER_SQFT = 0.37;     // ~370 ft of joint tape per 1,000 sq ft (USG guidance)

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // Non-negative percentage (waste). Invalid -> 0.
  function toPercent(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  function wallArea(lengthFt, widthFt, heightFt) {
    return 2 * (toPositive(lengthFt) + toPositive(widthFt)) * toPositive(heightFt);
  }

  function ceilingArea(lengthFt, widthFt) {
    return toPositive(lengthFt) * toPositive(widthFt);
  }

  // Number of sheets needed, including waste, rounded up to whole sheets.
  function sheets(areaSqFt, sheetSqFt, wastePct) {
    var sheet = toPositive(sheetSqFt) || DEFAULT_SHEET_SQFT;
    var area = toPositive(areaSqFt);
    if (area <= 0) return 0;
    return Math.ceil((area * (1 + toPercent(wastePct) / 100)) / sheet);
  }

  // opts: { areaSqFt, sheetSqFt, wastePct }
  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var sheetSqFt = toPositive(opts.sheetSqFt) || DEFAULT_SHEET_SQFT;
    var wastePct = toPercent(opts.wastePct);
    var sheetCount = sheets(area, sheetSqFt, wastePct);

    return {
      areaSqFt: area,
      sheetSqFt: sheetSqFt,
      wastePct: wastePct,
      sheets: sheetCount,
      screws: sheetCount * SCREWS_PER_SHEET,
      compoundGallons: Math.ceil((area / COMPOUND_SQFT_PER_GALLON) * 10) / 10,
      tapeFeet: Math.ceil(area * TAPE_FT_PER_SQFT)
    };
  }

  return {
    DEFAULT_SHEET_SQFT: DEFAULT_SHEET_SQFT,
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    SCREWS_PER_SHEET: SCREWS_PER_SHEET,
    COMPOUND_SQFT_PER_GALLON: COMPOUND_SQFT_PER_GALLON,
    TAPE_FT_PER_SQFT: TAPE_FT_PER_SQFT,
    toPositive: toPositive,
    toPercent: toPercent,
    wallArea: wallArea,
    ceilingArea: ceilingArea,
    sheets: sheets,
    calculate: calculate
  };
});
