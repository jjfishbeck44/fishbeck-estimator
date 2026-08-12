// public/js/calculators/schedule-math.js
// Project schedule + price: sum selected services' ranges and rough durations.
// Service list lives in pricing.js. UMD with dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.schedule = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  // opts: { serviceIds: [id, ...] }
  function calculate(opts) {
    opts = opts || {};
    var ids = Array.isArray(opts.serviceIds) ? opts.serviceIds : [];
    var byId = {};
    pricing.schedule.services.forEach(function (s) { byId[s.id] = s; });

    var low = 0, high = 0, days = 0, selected = [];
    ids.forEach(function (id) {
      var s = byId[id];
      if (!s) return;
      low += s.range[0]; high += s.range[1]; days += s.days;
      selected.push({ id: s.id, label: s.label, low: s.range[0], high: s.range[1], days: s.days });
    });

    return {
      low: low,
      high: high,
      days: days,
      // Crews overlap some work, so calendar time is usually less than the raw sum.
      calendarDays: Math.max(days, Math.ceil(days * 0.7)),
      selected: selected,
      services: pricing.schedule.services
    };
  }

  return { calculate: calculate };
});
