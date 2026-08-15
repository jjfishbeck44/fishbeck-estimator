// public/js/calculators/diy-math.js
// DIY vs. hire: compare DIY out-of-pocket (+ value of your time) to a pro quote.
// Default time value lives in pricing.js. UMD with dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.diy = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toMoney(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  // opts: { materialCost, hours, timeValuePerHour?, proQuote }
  function calculate(opts) {
    opts = opts || {};
    var materials = toMoney(opts.materialCost);
    var hours = toMoney(opts.hours);
    var timeValue = toMoney(opts.timeValuePerHour) || pricing.diyHire.defaultTimeValuePerHour;
    var proQuote = toMoney(opts.proQuote);

    var timeCost = hours * timeValue;
    var diyTrueCost = materials + timeCost; // out-of-pocket plus opportunity cost
    var cashSavings = proQuote - materials;       // vs hiring, ignoring your time
    var trueSavings = proQuote - diyTrueCost;     // vs hiring, counting your time

    var recommendation;
    if (proQuote <= 0) recommendation = 'enter a pro quote to compare';
    else if (trueSavings > 0) recommendation = 'DIY likely saves money';
    else recommendation = 'hiring a pro is likely worth it';

    return {
      materialCost: materials,
      hours: hours,
      timeValuePerHour: timeValue,
      proQuote: proQuote,
      timeCost: Math.round(timeCost),
      diyTrueCost: Math.round(diyTrueCost),
      cashSavings: Math.round(cashSavings),
      trueSavings: Math.round(trueSavings),
      recommendation: recommendation
    };
  }

  return { toMoney: toMoney, calculate: calculate };
});
