// public/js/pdf-export.js
// Dependency-free PDF writer for estimate exports.
// Text-only, built-in Helvetica fonts, US Letter, automatic page breaks.
// UMD: window.FPdf in the browser, require()-able in Jest (no DOM needed).
// Self-hosted on purpose: the site CSP is script-src 'self', so CDN libs are blocked.

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.FPdf = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PAGE_W = 612;
  var PAGE_H = 792;
  var MARGIN = 54;
  var BOTTOM = 72;
  var RANGE_X = 400;            // x position of the cost-range column
  var DESC_WIDTH = RANGE_X - MARGIN - 16;
  var FULL_WIDTH = PAGE_W - MARGIN * 2;
  var AVG_CHAR_EM = 0.52;       // conservative average Helvetica glyph width (em)

  var REPLACEMENTS = [
    [/[–—]/g, '-'],
    [/[‘’]/g, "'"],
    [/[“”]/g, '"'],
    [/…/g, '...'],
    [/×/g, 'x'],
    [/[·•]/g, '-'],
    [/[ ]/g, ' ']
  ];

  // Reduce text to printable ASCII so one JS char == one byte in the file.
  function sanitize(str) {
    var s = String(str == null ? '' : str);
    REPLACEMENTS.forEach(function (r) { s = s.replace(r[0], r[1]); });
    return s.replace(/[\r\n\t]+/g, ' ').replace(/[^\x20-\x7E]/g, '?');
  }

  function escapePdf(s) {
    return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function wrap(text, size, width) {
    var maxChars = Math.max(8, Math.floor(width / (size * AVG_CHAR_EM)));
    var words = sanitize(text).split(' ').filter(Boolean);
    var lines = [];
    var line = '';
    words.forEach(function (word) {
      while (word.length > maxChars) {            // hard-split very long tokens
        if (line) { lines.push(line); line = ''; }
        lines.push(word.slice(0, maxChars));
        word = word.slice(maxChars);
      }
      if (!line) line = word;
      else if ((line + ' ' + word).length <= maxChars) line += ' ' + word;
      else { lines.push(line); line = word; }
    });
    if (line) lines.push(line);
    return lines;
  }

  function money(n) {
    var v = Number(n);
    if (!isFinite(v)) v = 0;
    return '$' + Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function range(low, high) {
    return money(low) + ' - ' + money(high);
  }

  // Lay content out as pages of positioned text runs.
  function layout(est, opts) {
    opts = opts || {};
    var pages = [[]];
    var y = PAGE_H - MARGIN;

    function ensure(h) {
      if (y - h < BOTTOM) { pages.push([]); y = PAGE_H - MARGIN; }
    }
    function put(text, x, size, bold) {
      pages[pages.length - 1].push({ t: sanitize(text), x: x, y: y, s: size, b: !!bold });
    }
    function para(text, x, size, width, bold, lead) {
      lead = lead || size * 1.35;
      wrap(text, size, width).forEach(function (l) {
        ensure(lead);
        y -= lead;
        put(l, x, size, bold);
      });
    }
    function gap(h) { y -= h; }

    ensure(40);
    y -= 20; put('Fishbeck Innovations', MARGIN, 20, true);
    y -= 15; put('Project Estimate - Construction & Property Maintenance, Twin Cities MN', MARGIN, 9, false);
    var meta = [];
    if (opts.refId) meta.push('Reference: ' + opts.refId);
    meta.push('Date: ' + (opts.date || ''));
    y -= 13; put(meta.join('   |   '), MARGIN, 9, false);
    gap(14);

    if (opts.projectName) para('Project: ' + opts.projectName, MARGIN, 11, FULL_WIDTH, true);
    if (opts.description) { para(opts.description, MARGIN, 9.5, FULL_WIDTH, false); }
    gap(12);

    ensure(30);
    y -= 12; put('Scope item', MARGIN, 9, true); put('Estimate range', RANGE_X, 9, true);
    gap(4);

    (est.line_items || []).forEach(function (item) {
      var descLines = wrap(item.description || '', 9, DESC_WIDTH);
      ensure(14 + descLines.length * 12 + 6);
      y -= 14;
      put(item.label || '', MARGIN, 10.5, true);
      put(range(item.range_low, item.range_high), RANGE_X, 10.5, false);
      descLines.forEach(function (l) { y -= 12; put(l, MARGIN, 9, false); });
      gap(6);
    });

    ensure(34);
    gap(4);
    y -= 16; put('Total estimate', MARGIN, 12, true); put(range(est.total_low, est.total_high), RANGE_X, 12, true);
    gap(14);

    if (est.notes) {
      ensure(30);
      y -= 13; put('Notes', MARGIN, 10, true);
      para(est.notes, MARGIN, 9.5, FULL_WIDTH, false);
      gap(10);
    }

    var oos = est.out_of_scope || [];
    if (oos.length) {
      ensure(30);
      y -= 13; put('Outside core services', MARGIN, 10, true);
      oos.forEach(function (o) { para('- ' + o, MARGIN + 8, 9.5, FULL_WIDTH - 8, false); });
      gap(10);
    }

    para('This is an AI-generated estimate, not a binding quote. Contact jimmy@fishbeckinnovations.com for a formal proposal.',
      MARGIN, 8.5, FULL_WIDTH, false);
    return pages;
  }

  function f(n) { return String(Math.round(n * 100) / 100); }

  // Serialize pages to a PDF string (ASCII only, so length == byte count).
  function buildEstimatePdf(est, opts) {
    var pages = layout(est || {}, opts);
    var objs = [];                       // index 0 => object 1
    var pageCount = pages.length;
    var firstPageObj = 5;                // 1 catalog, 2 pages, 3 helv, 4 helv-bold

    var kids = [];
    for (var i = 0; i < pageCount; i++) kids.push((firstPageObj + i * 2) + ' 0 R');

    objs.push('<< /Type /Catalog /Pages 2 0 R >>');
    objs.push('<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + pageCount + ' >>');
    objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

    pages.forEach(function (runs, idx) {
      var contentObj = firstPageObj + idx * 2 + 1;
      var stream = runs.map(function (r) {
        return 'BT /' + (r.b ? 'F2' : 'F1') + ' ' + f(r.s) + ' Tf ' + f(r.x) + ' ' + f(r.y) +
          ' Td (' + escapePdf(r.t) + ') Tj ET';
      }).join('\n');
      objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PAGE_W + ' ' + PAGE_H + '] ' +
        '/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + contentObj + ' 0 R >>');
      objs.push('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
    });

    var out = '%PDF-1.4\n';
    var offsets = [];
    objs.forEach(function (body, i) {
      offsets.push(out.length);
      out += (i + 1) + ' 0 obj\n' + body + '\nendobj\n';
    });
    var xrefAt = out.length;
    out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
    offsets.forEach(function (o) { out += ('0000000000' + o).slice(-10) + ' 00000 n \n'; });
    out += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefAt + '\n%%EOF';
    return out;
  }

  // Binary-safe conversion for Blob construction.
  function toBytes(str) {
    var arr = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i) & 0xFF;
    return arr;
  }

  return { buildEstimatePdf: buildEstimatePdf, toBytes: toBytes, sanitize: sanitize, wrap: wrap, money: money };
});
