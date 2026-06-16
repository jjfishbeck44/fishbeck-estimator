// public/js/calculators/salt-math.js
// Pure de-icing-salt math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.salt = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Rock salt application rate. Industry guidance for parking lots is roughly
  // 10–20 lbs per 1,000 sq ft per application; 12 is a sensible default.
  var DEFAULT_RATE_LBS_PER_1000 = 12;
  var DEFAULT_BAG_LBS = 50;

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }

  function calculate(opts) {
    opts = opts || {};
    var area = toPositive(opts.areaSqFt);
    var rate = toPositive(opts.lbsPer1000) || DEFAULT_RATE_LBS_PER_1000;
    var bagLbs = toPositive(opts.bagLbs) || DEFAULT_BAG_LBS;
    var applications = toPositive(opts.applications) || 1;

    var perApp = (area / 1000) * rate;
    var totalLbs = perApp * applications;

    return {
      areaSqFt: area,
      lbsPer1000: rate,
      bagLbs: bagLbs,
      applications: applications,
      saltLbsPerApplication: perApp,
      saltLbs: totalLbs,
      bags: area > 0 ? Math.ceil(totalLbs / bagLbs) : 0
    };
  }

  return {
    DEFAULT_RATE_LBS_PER_1000: DEFAULT_RATE_LBS_PER_1000,
    DEFAULT_BAG_LBS: DEFAULT_BAG_LBS,
    toPositive: toPositive,
    calculate: calculate
  };
});
