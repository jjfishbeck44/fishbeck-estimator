// public/js/concrete-calculator.js — IIFE UI for the Concrete Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.concrete) || null;

  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var dimsGroup = document.getElementById('dims-group');
  var sqftGroup = document.getElementById('sqft-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var sqftInput = document.getElementById('sqft-input');
  var thicknessInput = document.getElementById('thickness-input');
  var wasteInput = document.getElementById('waste-input');
  var bagSelect = document.getElementById('bag-select');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultYards = document.getElementById('result-yards');
  var resultBags = document.getElementById('result-bags');
  var resultCuft = document.getElementById('result-cuft');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  var HISTORY_KEY = 'fishbeck_concrete_calcs';
  var MAX_HISTORY = 10;

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function num(n, dec) { return parseFloat(n.toFixed(typeof dec === 'number' ? dec : 1)).toLocaleString('en-US'); }
  function getMode() { var c = document.querySelector('input[name="area-mode"]:checked'); return c ? c.value : 'dims'; }
  function syncMode() { if (getMode() === 'sqft') { hide(dimsGroup); show(sqftGroup); } else { show(dimsGroup); hide(sqftGroup); } }
  function resolveArea() { return getMode() === 'sqft' ? math.toPositive(sqftInput.value) : (math.toPositive(lengthInput.value) * math.toPositive(widthInput.value)); }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var area = resolveArea();
    var thickness = math.toPositive(thicknessInput.value);
    if (area <= 0 || thickness <= 0) { calcError.textContent = 'Enter the slab size and a thickness greater than zero.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ areaSqFt: area, thicknessIn: thickness, wastePct: wasteInput.value, bagSizeLb: bagSelect.value });
    renderResult(r); saveToHistory(r); renderHistory();
  }

  function renderResult(r) {
    resultYards.textContent = num(r.cubicYardsRounded, 1);
    resultBags.textContent = r.bags.toLocaleString('en-US');
    resultCuft.textContent = num(r.cubicFeet, 1);
    resultArea.textContent = num(r.areaSqFt, 0) + ' sq ft at ' + num(r.thicknessIn, 1) + '" + ' + num(r.wastePct, 0) + '% waste';
    resultNote.textContent = 'Order about ' + num(r.cubicYardsRounded, 1) + ' cubic yards of ready-mix, or ' + r.bags +
      ' bags of ' + num(r.bagSizeLb, 0) + 'lb pre-mix. For ready-mix delivery, suppliers sell in 0.25–0.5 yard increments.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to pour about ' + num(r.cubicYardsRounded, 1) + ' cubic yards of concrete (~' +
      num(r.areaSqFt, 0) + ' sq ft at ' + num(r.thicknessIn, 1) + '")';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function saveToHistory(r) {
    var h = getHistory();
    h.unshift({ areaSqFt: r.areaSqFt, thicknessIn: r.thicknessIn, wastePct: r.wastePct, bagSizeLb: r.bagSizeLb, cubicYardsRounded: r.cubicYardsRounded, timestamp: Date.now() });
    if (h.length > MAX_HISTORY) h = h.slice(0, MAX_HISTORY);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
  }
  function renderHistory() {
    var h = getHistory();
    if (h.length === 0) { hide(historyCard); return; }
    show(historyCard); historyList.innerHTML = '';
    h.forEach(function (e) {
      var item = document.createElement('div');
      item.className = 'history-item'; item.setAttribute('role', 'button'); item.setAttribute('tabindex', '0');
      var dateStr = new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      item.innerHTML = '<div class="history-input">' + escHtml(num(e.areaSqFt, 0) + ' sq ft @ ' + num(e.thicknessIn, 1) + '"') + '</div>' +
        '<div class="history-meta"><span class="history-range">' + num(e.cubicYardsRounded, 1) + ' cu yd</span><span class="history-date">' + escHtml(dateStr) + '</span></div>';
      function replay() {
        document.querySelector('input[name="area-mode"][value="sqft"]').checked = true; syncMode();
        sqftInput.value = e.areaSqFt; thicknessInput.value = e.thicknessIn; wasteInput.value = e.wastePct; bagSelect.value = String(e.bagSizeLb); calculate();
      }
      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') replay(); });
      historyList.appendChild(item);
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  Array.prototype.forEach.call(modeRadios, function (r) { r.addEventListener('change', syncMode); });
  [lengthInput, widthInput, sqftInput, thicknessInput, wasteInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', function () { try { localStorage.removeItem(HISTORY_KEY); } catch {} renderHistory(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncMode(); renderHistory();
})();
