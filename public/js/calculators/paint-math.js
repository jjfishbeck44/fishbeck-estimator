// public/js/calculators/paint-math.js
// Pure paint-quantity math — no DOM, no I/O.
// UMD guard: browser global (window.FCalc.paint) + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FCalc = root.FCalc || {};
    root.FCalc.paint = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var COVERAGE_SQFT_PER_GALLON = 350; // typical coverage for one coat on primed drywall
  var DOOR_SQFT = 21;                 // standard 3' x 7' door
  var WINDOW_SQFT = 15;               // average window opening
  var DEFAULT_COATS = 2;

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // Non-negative whole count (doors, windows). Invalid -> 0.
  function toCount(value) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    return isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  // Wall area of a room: perimeter x ceiling height.
  function wallAreaFromRoom(lengthFt, widthFt, heightFt) {
    return 2 * (toPositive(lengthFt) + toPositive(widthFt)) * toPositive(heightFt);
  }

  // Net area to paint after subtracting doors and windows (never below 0).
  function paintableArea(wallAreaSqFt, doors, windows) {
    var net = toPositive(wallAreaSqFt) - toCount(doors) * DOOR_SQFT - toCount(windows) * WINDOW_SQFT;
    return net > 0 ? net : 0;
  }

  // Gallons of paint for the given area, coats, and coverage rate.
  function gallons(paintableSqFt, coats, coveragePerGallon) {
    var cov = toPositive(coveragePerGallon) || COVERAGE_SQFT_PER_GALLON;
    var nCoats = toPositive(coats) || DEFAULT_COATS;
    return (toPositive(paintableSqFt) * nCoats) / cov;
  }

  // opts: { wallAreaSqFt, doors, windows, coats, coveragePerGallon }
  function calculate(opts) {
    opts = opts || {};
    var coverage = toPositive(opts.coveragePerGallon) || COVERAGE_SQFT_PER_GALLON;
    var coats = toPositive(opts.coats) || DEFAULT_COATS;
    var net = paintableArea(opts.wallAreaSqFt, opts.doors, opts.windows);
    var gal = gallons(net, coats, coverage);

    return {
      wallAreaSqFt: toPositive(opts.wallAreaSqFt),
      doors: toCount(opts.doors),
      windows: toCount(opts.windows),
      paintableArea: net,
      coats: coats,
      coveragePerGallon: coverage,
      gallons: gal,
      gallonsRounded: Math.ceil(gal * 10) / 10,
      gallonsToBuy: Math.ceil(gal)
    };
  }

  return {
    COVERAGE_SQFT_PER_GALLON: COVERAGE_SQFT_PER_GALLON,
    DOOR_SQFT: DOOR_SQFT,
    WINDOW_SQFT: WINDOW_SQFT,
    DEFAULT_COATS: DEFAULT_COATS,
    toPositive: toPositive,
    toCount: toCount,
    wallAreaFromRoom: wallAreaFromRoom,
    paintableArea: paintableArea,
    gallons: gallons,
    calculate: calculate
  };
});
