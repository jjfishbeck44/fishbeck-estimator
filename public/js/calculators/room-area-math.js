// public/js/calculators/room-area-math.js
// Pure square-footage helper — sums multiple rectangular areas. No DOM.
// UMD: browser global (FCalc.roomArea) + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.roomArea = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function rectangleArea(lengthFt, widthFt) {
    return toPositive(lengthFt) * toPositive(widthFt);
  }

  // rooms: array of { lengthFt, widthFt }. Returns the summed square footage.
  function totalArea(rooms) {
    if (!Array.isArray(rooms)) return 0;
    return rooms.reduce(function (sum, r) {
      return sum + rectangleArea(r && r.lengthFt, r && r.widthFt);
    }, 0);
  }

  return {
    toPositive: toPositive,
    rectangleArea: rectangleArea,
    totalArea: totalArea
  };
});
