// public/js/calculators/property-assessment-math.js
// Pure assessment-cost math: base fee + travel (beyond free radius) + scope items.
// Distance comes from the /api/travel-distance endpoint. Rates live in pricing.js.
// UMD with pricing dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.propertyAssessment = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  var A = pricing.propertyAssessment;

  // Travel charge: round-trip miles beyond the free radius × per-mile rate.
  function travelCost(distanceMiles) {
    var miles = toPositive(distanceMiles);
    var billable = Math.max(0, miles - A.freeRadiusMiles);
    return Math.round(billable * 2 * A.perMileRoundTrip);
  }

  // opts: { distanceMiles, options: [optionKey, ...] }
  function calculate(opts) {
    opts = opts || {};
    var distance = toPositive(opts.distanceMiles);
    var keys = Array.isArray(opts.options) ? opts.options : [];

    var optionsCost = 0, selected = [];
    keys.forEach(function (key) {
      var opt = A.options[key];
      if (!opt) return;
      optionsCost += opt.price;
      selected.push({ key: key, label: opt.label, price: opt.price });
    });

    var travel = travelCost(distance);
    return {
      distanceMiles: distance,
      baseFee: A.baseFee,
      travelCost: travel,
      optionsCost: optionsCost,
      total: A.baseFee + travel + optionsCost,
      selected: selected,
      options: A.options,
      freeRadiusMiles: A.freeRadiusMiles
    };
  }

  return { toPositive: toPositive, travelCost: travelCost, calculate: calculate };
});
