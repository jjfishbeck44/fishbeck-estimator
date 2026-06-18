// public/js/calculators/snow-math.js
// Seasonal snow-removal estimate = per-visit range × number of visits.
// Rates live in pricing.js. UMD with pricing dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.snow = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toCount(value, fallback) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    return isFinite(n) && n > 0 ? Math.floor(n) : (fallback || 0);
  }

  function calculate(opts) {
    opts = opts || {};
    var tier = pricing.snow.tiers[opts.tierKey];
    var visits = toCount(opts.visits, pricing.snow.defaultVisitsPerSeason);
    if (!tier) return { valid: false, tiers: pricing.snow.tiers };
    return {
      valid: true,
      tierKey: opts.tierKey,
      label: tier.label,
      perVisitLow: tier.perVisit[0],
      perVisitHigh: tier.perVisit[1],
      visits: visits,
      seasonLow: tier.perVisit[0] * visits,
      seasonHigh: tier.perVisit[1] * visits,
      tiers: pricing.snow.tiers
    };
  }

  return { toCount: toCount, calculate: calculate };
});
