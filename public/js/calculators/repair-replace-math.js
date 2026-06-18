// public/js/calculators/repair-replace-math.js
// Repair-vs-replace guidance for a building system, from age + condition.
// Ranges/lifespans live in pricing.js. UMD with pricing dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.repairReplace = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toAge(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : 0;
  }

  // opts: { system, ageYears, condition: 'good'|'fair'|'poor' }
  function calculate(opts) {
    opts = opts || {};
    var sys = pricing.repairReplace[opts.system];
    if (!sys) return { valid: false, systems: pricing.repairReplace };

    var age = toAge(opts.ageYears);
    var condition = opts.condition || 'fair';
    var lifeUsed = sys.lifespanYears > 0 ? age / sys.lifespanYears : 0;

    // Simple decision model: end-of-life or poor+old → replace.
    var recommendation, reason;
    if (lifeUsed >= 1) {
      recommendation = 'replace';
      reason = 'It is past its typical ' + sys.lifespanYears + '-year service life, so repairs are usually throwing good money after bad.';
    } else if (condition === 'poor' && lifeUsed >= 0.7) {
      recommendation = 'replace';
      reason = 'It is in poor condition and near end of life — replacing now avoids repeat repairs and emergency failure.';
    } else if (condition === 'good' || lifeUsed < 0.5) {
      recommendation = 'repair';
      reason = 'It still has plenty of life left, so a targeted repair is the cost-effective move.';
    } else {
      recommendation = 'repair';
      reason = 'Repair for now, but start budgeting for replacement within a few years.';
    }

    return {
      valid: true,
      system: opts.system,
      label: sys.label,
      ageYears: age,
      condition: condition,
      lifespanYears: sys.lifespanYears,
      percentOfLifeUsed: Math.min(100, Math.round(lifeUsed * 100)),
      repairLow: sys.repair[0],
      repairHigh: sys.repair[1],
      replaceLow: sys.replace[0],
      replaceHigh: sys.replace[1],
      recommendation: recommendation,
      reason: reason,
      systems: pricing.repairReplace
    };
  }

  return { toAge: toAge, calculate: calculate };
});
