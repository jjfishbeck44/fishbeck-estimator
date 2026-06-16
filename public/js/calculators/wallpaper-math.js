// public/js/calculators/wallpaper-math.js
// Pure wallpaper-quantity math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.wallpaper = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_WASTE_PCT = 15;  // pattern-matching waste
  var DOOR_SQFT = 21;
  var WINDOW_SQFT = 15;
  var DEFAULT_ROLL_SQFT = 28;  // usable coverage of a single roll after trim

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

  function wallAreaFromRoom(lengthFt, widthFt, heightFt) {
    return 2 * (toPositive(lengthFt) + toPositive(widthFt)) * toPositive(heightFt);
  }

  function netArea(wallAreaSqFt, doors, windows) {
    var net = toPositive(wallAreaSqFt) - toCount(doors) * DOOR_SQFT - toCount(windows) * WINDOW_SQFT;
    return net > 0 ? net : 0;
  }

  function calculate(opts) {
    opts = opts || {};
    var net = netArea(opts.wallAreaSqFt, opts.doors, opts.windows);
    var wastePct = toPercent(opts.wastePct);
    var rollSqFt = toPositive(opts.rollSqFt) || DEFAULT_ROLL_SQFT;

    return {
      wallAreaSqFt: toPositive(opts.wallAreaSqFt),
      netArea: net,
      wastePct: wastePct,
      rollSqFt: rollSqFt,
      rolls: net > 0 ? Math.ceil((net * (1 + wastePct / 100)) / rollSqFt - 1e-9) : 0
    };
  }

  return {
    DEFAULT_WASTE_PCT: DEFAULT_WASTE_PCT,
    DOOR_SQFT: DOOR_SQFT,
    WINDOW_SQFT: WINDOW_SQFT,
    DEFAULT_ROLL_SQFT: DEFAULT_ROLL_SQFT,
    toPositive: toPositive,
    toPercent: toPercent,
    toCount: toCount,
    wallAreaFromRoom: wallAreaFromRoom,
    netArea: netArea,
    calculate: calculate
  };
});
