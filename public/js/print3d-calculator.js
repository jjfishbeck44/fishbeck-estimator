// public/js/print3d-calculator.js — IIFE UI for the 3D Print Request tool.
// Shows an indicative estimate and builds a mailto to collect the request.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.print3d) || null;
  var EMAIL = 'jimmy@fishbeckinnovations.com';

  var linkInput = document.getElementById('link-input');
  var qtyInput = document.getElementById('qty-input');
  var multicolorCheckbox = document.getElementById('multicolor-checkbox');
  var colorsSelect = document.getElementById('colors-select');
  var gramsInput = document.getElementById('grams-input');
  var hoursInput = document.getElementById('hours-input');
  var shipSelect = document.getElementById('ship-select');
  var nameInput = document.getElementById('name-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultTotal = document.getElementById('result-total');
  var resultPerunit = document.getElementById('result-perunit');
  var resultColors = document.getElementById('result-colors');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var requestLink = document.getElementById('request-link');
  var footerYear = document.getElementById('footer-year');

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function syncColors() {
    if (!colorsSelect) return;
    colorsSelect.disabled = !multicolorCheckbox.checked;
  }

  function colorCount() {
    return multicolorCheckbox.checked ? parseInt(colorsSelect.value, 10) : 1;
  }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var link = (linkInput.value || '').trim();
    if (!link) { calcError.textContent = 'Paste a link to your model (.stl file or a MakerWorld / Bambu listing).'; show(calcError); hide(resultsCard); hide(ctaCard); return; }

    var ship = shipSelect.value === 'ship';
    var r = math.calculate({
      quantity: qtyInput.value,
      colors: colorCount(),
      grams: gramsInput.value,
      hours: hoursInput.value,
      ship: ship
    });

    resultTotal.textContent = money(r.total);
    resultPerunit.textContent = money(r.perUnit);
    resultColors.textContent = r.colors === 1 ? 'Single' : r.colors + '-color';
    resultArea.textContent = r.quantity + '× · ' + (r.colors === 1 ? 'single color' : r.colors + ' colors') +
      ' · ' + (r.ship ? 'shipped' : 'pickup');
    resultNote.textContent = 'Indicative estimate: ' + money(r.total) + ' for ' + r.quantity + ' ' +
      (r.quantity === 1 ? 'print' : 'prints') + (r.colors > 1 ? ' in ' + r.colors + ' colors' : '') +
      (r.ship ? ', shipped' : ', picked up') + '. Multicolor uses more time and filament, so it costs more. ' +
      'Send the request and I’ll confirm exact pricing after slicing your model.';

    requestLink.href = buildMailto(r, link);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildMailto(r, link) {
    var lines = [
      '3D PRINT REQUEST',
      '',
      'Model link: ' + link,
      'Quantity: ' + r.quantity,
      'Colors: ' + (r.colors === 1 ? 'Single color' : r.colors + ' colors (AMS Lite)'),
      'Est. filament: ' + (r.grams > 0 ? r.grams + ' g' : 'not sure'),
      'Est. print time: ' + (r.hours > 0 ? r.hours + ' h' : 'not sure'),
      'Delivery: ' + (r.ship ? 'Ship to me' : 'Pickup'),
      'Indicative estimate: ' + money(r.total),
      ''
    ];
    if ((nameInput.value || '').trim()) lines.push('Name: ' + nameInput.value.trim());
    lines.push('', 'Please confirm exact pricing and lead time. Thanks!');
    return 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent('3D Print Request') +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  if (multicolorCheckbox) multicolorCheckbox.addEventListener('change', syncColors);
  if (calcBtn) calcBtn.addEventListener('click', calculate);
  [linkInput, qtyInput, gramsInput, hoursInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncColors();
})();
