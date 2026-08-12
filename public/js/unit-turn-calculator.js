// public/js/unit-turn-calculator.js — IIFE UI for the Rental Unit-Turn Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.unitTurn) || null;

  var sizeSelect = document.getElementById('size-select');
  var itemBoxes = document.querySelectorAll('.turn-item');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultTotal = document.getElementById('result-total');
  var resultCount = document.getElementById('result-count');
  var resultBreakdown = document.getElementById('result-breakdown');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var footerYear = document.getElementById('footer-year');

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function range(lo, hi) { return money(lo) + '–' + money(hi); }

  function selectedItems() {
    return Array.prototype.filter.call(itemBoxes, function (b) { return b.checked; }).map(function (b) { return b.value; });
  }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var items = selectedItems();
    if (items.length === 0) { calcError.textContent = 'Select at least one item in the turn scope.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ size: sizeSelect.value, items: items });
    resultTotal.textContent = range(r.low, r.high);
    resultCount.textContent = r.selected.length + ' ' + (r.selected.length === 1 ? 'item' : 'items');
    resultBreakdown.innerHTML = '';
    r.selected.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'breakdown-row';
      li.innerHTML = '<span>' + escHtml(s.label) + '</span><span class="breakdown-range">' + range(s.low, s.high) + '</span>';
      resultBreakdown.appendChild(li);
    });
    resultNote.textContent = 'Estimated turn cost for a ' + sizeSelect.options[sizeSelect.selectedIndex].text +
      ': ' + range(r.low, r.high) + '. Final pricing depends on condition and finishes — get a firm quote below.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var labels = r.selected.map(function (s) { return s.label.toLowerCase(); }).join(', ');
    var msg = 'I need to turn a ' + sizeSelect.options[sizeSelect.selectedIndex].text + ' rental unit: ' + labels;
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
