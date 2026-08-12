// public/js/calculators/print3d-math.js
// Indicative 3D-print pricing (Bambu A1 + AMS Lite). Real slice time/material
// can't be computed in-browser, so this uses a transparent formula with the
// user's estimated grams/hours. Constants live in pricing.js.
// UMD with pricing dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.print3d = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toQty(value) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    return isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }
  function toColors(value) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    if (!isFinite(n) || n < 1) return 1;
    if (n > 4) return 4; // A1 + AMS Lite supports up to 4 colors
    return Math.floor(n);
  }

  var P = pricing.print3d;

  // opts: { quantity, colors, grams, hours, ship }
  function calculate(opts) {
    opts = opts || {};
    var qty = toQty(opts.quantity);
    var colors = toColors(opts.colors);
    var grams = toPositive(opts.grams);
    var hours = toPositive(opts.hours);
    var ship = !!opts.ship;

    var mult = P.colorMultiplier[colors] || 1.0;
    var perUnitMatTime = (grams * P.perGram + hours * P.perPrintHour) * mult;
    var materialTimeCost = perUnitMatTime * qty;
    var shipping = ship ? P.shippingFee : 0;
    var total = P.baseFee + P.perItemSetup + materialTimeCost + shipping;

    return {
      quantity: qty,
      colors: colors,
      grams: grams,
      hours: hours,
      ship: ship,
      multiplier: mult,
      perUnit: Math.round(P.baseFee + P.perItemSetup + perUnitMatTime),
      shipping: shipping,
      total: Math.round(total)
    };
  }

  return { toPositive: toPositive, toQty: toQty, toColors: toColors, calculate: calculate };
});
