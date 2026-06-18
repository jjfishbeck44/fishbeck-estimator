// public/js/calculators/unit-turn-math.js
// Rental unit-turn cost = sum of selected scope items × unit-size multiplier.
// Ranges live in pricing.js. UMD with pricing dependency.

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./pricing'));
  else { root.FCalc = root.FCalc || {}; root.FCalc.unitTurn = factory(root.FCalc.pricing); }
})(typeof self !== 'undefined' ? self : this, function (pricing) {
  'use strict';

  // opts: { size: 'studio'|'1br'|'2br'|'3br', items: [itemKey, ...] }
  function calculate(opts) {
    opts = opts || {};
    var mult = pricing.unitTurn.sizeMultiplier[opts.size];
    if (!mult) mult = 1.0;
    var items = Array.isArray(opts.items) ? opts.items : [];

    var low = 0, high = 0, selected = [];
    items.forEach(function (key) {
      var item = pricing.unitTurn.items[key];
      if (!item) return;
      var lo = Math.round(item.range[0] * mult);
      var hi = Math.round(item.range[1] * mult);
      low += lo; high += hi;
      selected.push({ key: key, label: item.label, low: lo, high: hi });
    });

    return {
      size: opts.size || '1br',
      multiplier: mult,
      low: low,
      high: high,
      selected: selected,
      items: pricing.unitTurn.items,
      sizeMultiplier: pricing.unitTurn.sizeMultiplier
    };
  }

  return { calculate: calculate };
});
