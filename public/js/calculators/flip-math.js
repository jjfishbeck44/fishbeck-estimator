// public/js/calculators/flip-math.js
// Fix-n-flip profit & ROI from purchase price, rehab budget, and ARV.
// Selling/holding cost percentages live in pricing.js. UMD with dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.flip = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  function toMoney(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toPercent(value, fallback) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n >= 0 ? n : (fallback || 0);
  }

  // opts: { purchase, rehab, arv, sellingCostPct?, holdingCostPct? }
  function calculate(opts) {
    opts = opts || {};
    var purchase = toMoney(opts.purchase);
    var rehab = toMoney(opts.rehab);
    var arv = toMoney(opts.arv);
    var sellingPct = toPercent(opts.sellingCostPct, pricing.flip.sellingCostPct);
    var holdingPct = toPercent(opts.holdingCostPct, pricing.flip.holdingCostPct);

    var sellingCost = arv * (sellingPct / 100);
    var holdingCost = (purchase + rehab) * (holdingPct / 100);
    var totalInvested = purchase + rehab + holdingCost + sellingCost;
    var profit = arv - totalInvested;
    var cashIn = purchase + rehab + holdingCost; // before sale proceeds
    var roi = cashIn > 0 ? (profit / cashIn) * 100 : 0;

    return {
      purchase: purchase,
      rehab: rehab,
      arv: arv,
      sellingCost: Math.round(sellingCost),
      holdingCost: Math.round(holdingCost),
      totalInvested: Math.round(totalInvested),
      profit: Math.round(profit),
      roiPct: Math.round(roi * 10) / 10,
      // The classic 70% rule max offer: 70% of ARV minus rehab.
      maxOffer70: Math.round(arv * 0.7 - rehab)
    };
  }

  return { toMoney: toMoney, toPercent: toPercent, calculate: calculate };
});
