// public/js/calculators/fence-math.js
// Pure fence-material math — no DOM. UMD: browser global + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.fence = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_SPACING_FT = 8;            // post spacing / panel width
  var DEFAULT_RAILS_PER_SECTION = 2;     // 2 rails for most privacy/picket fences
  var DEFAULT_CONCRETE_BAGS_PER_POST = 2; // ~two 50lb bags per post hole

  function toPositive(value) {
    var n = typeof value === 'number' ? value : parseFloat(value);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toCount(value) {
    var n = typeof value === 'number' ? value : parseInt(value, 10);
    return isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }

  function sections(lengthFt, spacingFt) {
    var span = toPositive(spacingFt) || DEFAULT_SPACING_FT;
    var len = toPositive(lengthFt);
    if (len <= 0) return 0;
    return Math.ceil(len / span);
  }

  function calculate(opts) {
    opts = opts || {};
    var len = toPositive(opts.lengthFt);
    var spacing = toPositive(opts.postSpacingFt) || DEFAULT_SPACING_FT;
    var railsPer = toCount(opts.railsPerSection) || DEFAULT_RAILS_PER_SECTION;
    var bagsPerPost = toPositive(opts.concreteBagsPerPost) || DEFAULT_CONCRETE_BAGS_PER_POST;

    var sec = sections(len, spacing);
    var posts = sec > 0 ? sec + 1 : 0; // one extra post to close the run

    return {
      lengthFt: len,
      postSpacingFt: spacing,
      railsPerSection: railsPer,
      sections: sec,
      posts: posts,
      rails: sec * railsPer,
      concreteBags: Math.ceil(posts * bagsPerPost)
    };
  }

  return {
    DEFAULT_SPACING_FT: DEFAULT_SPACING_FT,
    DEFAULT_RAILS_PER_SECTION: DEFAULT_RAILS_PER_SECTION,
    DEFAULT_CONCRETE_BAGS_PER_POST: DEFAULT_CONCRETE_BAGS_PER_POST,
    toPositive: toPositive,
    toCount: toCount,
    sections: sections,
    calculate: calculate
  };
});
