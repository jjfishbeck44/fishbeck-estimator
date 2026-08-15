// public/js/calculators/tool-rental-math.js
// Tool rental cost = hourly rate × hours. Rates live in pricing.js.
// UMD with a pricing dependency: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.toolRental = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function calculate(opts) {
    opts = opts || {};
    var tool = pricing.toolRental[opts.toolKey];
    var hours = toPositive(opts.hours);
    if (!tool || hours <= 0) {
      return { valid: false, tools: pricing.toolRental, cost: 0 };
    }
    return {
      valid: true,
      toolKey: opts.toolKey,
      label: tool.label,
      perHour: tool.perHour,
      hours: hours,
      cost: tool.perHour * hours,
      tools: pricing.toolRental
    };
  }

  return { toPositive: toPositive, calculate: calculate };
});
