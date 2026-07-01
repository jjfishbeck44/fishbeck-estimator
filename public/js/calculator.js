'use strict';
/* Fishbeck Innovations — Instant Price Calculator
   Deterministic, client-side estimate tool. No API calls.
   Pricing: 2024 Twin Cities market rates (see 09_Knowledge_Base/Pricing).
   CSP-safe: no inline handlers — all events bound via addEventListener. */
(function () {
  // group | name | unit | low | high
  var PRICING = [
    ['Turns', 'Unit turn — standard (paint, clean, patch, hardware)', 'per unit', 800, 1500],
    ['Turns', 'Unit turn — heavy (flooring, full repaint, appliances)', 'per unit', 1500, 3500],
    ['Bathroom', 'Bathroom remodel — cosmetic', 'per bath', 2500, 5000],
    ['Bathroom', 'Bathroom remodel — gut & rebuild', 'per bath', 6000, 14000],
    ['Kitchen', 'Kitchen remodel — cosmetic', 'per kitchen', 3000, 7000],
    ['Kitchen', 'Kitchen remodel — gut & rebuild', 'per kitchen', 8000, 25000],
    ['Kitchen', 'Stock cabinets', 'per linear ft', 185, 425],
    ['Kitchen', 'Custom cabinets', 'per linear ft', 450, 1200],
    ['Kitchen', 'Quartz countertops', 'per sq ft', 65, 125],
    ['Flooring', 'LVP (luxury vinyl plank) install', 'per sq ft', 4.5, 9],
    ['Flooring', 'Hardwood flooring', 'per sq ft', 8, 18],
    ['Flooring', 'Ceramic tile', 'per sq ft', 6, 15],
    ['Flooring', 'Carpet install', 'per sq ft', 3.5, 8.5],
    ['Flooring', 'Carpet removal & disposal', 'per sq ft', 1, 2],
    ['Painting', 'Interior painting', 'per room', 300, 700],
    ['Painting', 'Interior paint', 'per sq ft wall', 1.85, 3.5],
    ['Painting', 'Exterior painting', 'per side of house', 500, 1500],
    ['Painting', 'Exterior paint', 'per sq ft', 2.25, 4.75],
    ['Painting', 'Trim painting', 'per linear ft', 2.5, 6],
    ['Painting', 'Deck / siding staining', 'per sq ft', 1.95, 4.25],
    ['Drywall & Insulation', 'Drywall install', 'per sq ft', 2.25, 4.25],
    ['Drywall & Insulation', 'Drywall finishing', 'per sq ft', 1.75, 3.5],
    ['Drywall & Insulation', 'Drywall patch (small)', 'per patch', 75, 200],
    ['Drywall & Insulation', 'Batt insulation', 'per sq ft', 1.25, 2.75],
    ['Drywall & Insulation', 'Spray foam insulation', 'per sq ft', 2.5, 5.5],
    ['Drywall & Insulation', 'Popcorn ceiling removal', 'per sq ft', 2, 4],
    ['Roofing', 'Roof inspection', 'flat', 150, 300],
    ['Roofing', 'Roof repair — minor', 'flat', 500, 2500],
    ['Roofing', 'Asphalt shingle roofing', 'per sq ft', 4.5, 8.5],
    ['Roofing', 'Metal roofing', 'per sq ft', 8, 18],
    ['Framing & Concrete', 'Wood framing (walls)', 'per sq ft', 8, 16],
    ['Framing & Concrete', 'Floor joists (wood)', 'per sq ft', 6, 12],
    ['Framing & Concrete', 'Roof trusses', 'per sq ft', 4.5, 8.5],
    ['Framing & Concrete', 'Concrete flatwork (4" slab)', 'per sq ft', 6.5, 12.5],
    ['Demolition', 'Interior demolition', 'per room', 500, 2000],
    ['Demolition', 'Full unit demolition', 'per unit', 3000, 8000],
    ['Fixtures', 'Cabinet hardware replacement', 'per unit', 100, 300],
    ['Fixtures', 'Light fixture replacement', 'per fixture', 75, 200],
    ['Fixtures', 'Interior door replacement', 'per door', 200, 500],
    ['Fixtures', 'Appliance installation', 'per appliance', 100, 250],
    ['Exterior & Grounds', 'Power washing', 'flat', 200, 500],
    ['Exterior & Grounds', 'Deck repair / staining', 'flat', 500, 2000],
    ['Exterior & Grounds', 'Gutter cleaning', 'flat', 100, 250],
    ['Exterior & Grounds', 'Fence repair', 'per section', 200, 600],
    ['General', 'General maintenance visit', 'per visit', 150, 400],
    ['General', 'Junk removal / cleanout', 'per unit', 300, 800]
  ];

  var items = [];
  var svc, qty, hint, rows, conting, cpct;

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function buildOptions() {
    var groups = {};
    PRICING.forEach(function (p, i) { (groups[p[0]] = groups[p[0]] || []).push(i); });
    Object.keys(groups).forEach(function (g) {
      var og = document.createElement('optgroup');
      og.label = g;
      groups[g].forEach(function (i) {
        var o = document.createElement('option');
        o.value = i;
        o.textContent = PRICING[i][1] + ' (' + PRICING[i][2] + ')';
        og.appendChild(o);
      });
      svc.appendChild(og);
    });
  }

  function updateHint() {
    var p = PRICING[svc.value];
    hint.textContent = money(p[3]) + ' – ' + money(p[4]) + ' ' + p[2];
  }

  function addItem() {
    var idx = +svc.value;
    var q = parseFloat(qty.value) || 0;
    if (q <= 0) { qty.focus(); return; }
    items.push({ idx: idx, qty: q });
    qty.value = 1;
    render();
  }

  function render() {
    if (!items.length) {
      rows.innerHTML = '<tr><td colspan="5" class="empty">No items yet — add work above to see a cost range.</td></tr>';
      return;
    }
    var lowT = 0, highT = 0, html = '';
    items.forEach(function (it, i) {
      var p = PRICING[it.idx], lo = p[3] * it.qty, hi = p[4] * it.qty;
      lowT += lo; highT += hi;
      html += '<tr><td>' + p[1] + '<br><span class="sub">' + money(p[3]) + '–' + money(p[4]) + ' ' + p[2] + '</span></td>'
        + '<td class="num">' + it.qty + '</td><td class="num">' + money(lo) + '</td><td class="num">' + money(hi) + '</td>'
        + '<td class="no-print"><button class="rm" title="Remove" data-i="' + i + '" aria-label="Remove item">&times;</button></td></tr>';
    });
    if (conting.checked) {
      var c = parseFloat(cpct.value);
      var cl = lowT * c, ch = highT * c;
      html += '<tr><td>Contingency (' + (c * 100) + '%)</td><td class="num"></td><td class="num">' + money(cl) + '</td><td class="num">' + money(ch) + '</td><td class="no-print"></td></tr>';
      lowT += cl; highT += ch;
    }
    html += '<tr class="totrow"><td>Estimated total range</td><td class="num"></td><td class="num">' + money(lowT) + '</td><td class="num">' + money(highT) + '</td><td class="no-print"></td></tr>';
    rows.innerHTML = html;
  }

  function clearAll() { items = []; render(); }

  function copyEst(btn) {
    if (!items.length) { return; }
    var lines = ['Fishbeck Innovations — Estimate', ''], lowT = 0, highT = 0;
    items.forEach(function (it) {
      var p = PRICING[it.idx], lo = p[3] * it.qty, hi = p[4] * it.qty;
      lowT += lo; highT += hi;
      lines.push(p[1] + ' x' + it.qty + ': ' + money(lo) + '–' + money(hi));
    });
    if (conting.checked) {
      var c = parseFloat(cpct.value);
      lines.push('Contingency (' + (c * 100) + '%): ' + money(lowT * c) + '–' + money(highT * c));
      lowT += lowT * c; highT += highT * c;
    }
    lines.push('', 'TOTAL: ' + money(lowT) + '–' + money(highT));
    lines.push('', 'Fishbeck Innovations LLC · Jimmy@fishbeckinnovations.com');
    navigator.clipboard.writeText(lines.join('\n')).then(function () {
      var t = btn.textContent; btn.textContent = 'Copied!';
      setTimeout(function () { btn.textContent = t; }, 1400);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    svc = document.getElementById('svc');
    qty = document.getElementById('qty');
    hint = document.getElementById('hint');
    rows = document.getElementById('rows');
    conting = document.getElementById('conting');
    cpct = document.getElementById('cpct');

    buildOptions();
    updateHint();

    svc.addEventListener('change', updateHint);
    conting.addEventListener('change', render);
    cpct.addEventListener('change', render);
    document.getElementById('addBtn').addEventListener('click', addItem);
    document.getElementById('printBtn').addEventListener('click', function () { window.print(); });
    document.getElementById('clearBtn').addEventListener('click', clearAll);
    document.getElementById('copyBtn').addEventListener('click', function () { copyEst(this); });
    qty.addEventListener('keydown', function (e) { if (e.key === 'Enter') { addItem(); } });

    // event delegation for remove buttons
    rows.addEventListener('click', function (e) {
      var b = e.target.closest('.rm');
      if (b) { items.splice(+b.getAttribute('data-i'), 1); render(); }
    });
  });
})();
