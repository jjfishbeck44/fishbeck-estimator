// public/js/pavers-calculator.js — IIFE UI for the Paver Patio Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.pavers) || null;

  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var dimsGroup = document.getElementById('dims-group');
  var sqftGroup = document.getElementById('sqft-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var sqftInput = document.getElementById('sqft-input');
  var paverLInput = document.getElementById('paver-l-input');
  var paverWInput = document.getElementById('paver-w-input');
  var wasteInput = document.getElementById('waste-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultPavers = document.getElementById('result-pavers');
  var resultBase = document.getElementById('result-base');
  var resultSand = document.getElementById('result-sand');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  var HISTORY_KEY = 'fishbeck_pavers_calcs';
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
    if (area <= 0) { calcError.textContent = 'Enter the patio size or total square footage.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ areaSqFt: area, wastePct: wasteInput.value, paverLengthIn: paverLInput.value, paverWidthIn: paverWInput.value });
    renderResult(r); saveToHistory(r); renderHistory();
  }

  function renderResult(r) {
    resultPavers.textContent = r.pavers.toLocaleString('en-US');
    resultBase.textContent = num(r.baseCuYd, 1);
    resultSand.textContent = num(r.sandCuYd, 1);
    resultArea.textContent = num(r.areaSqFt, 0) + ' sq ft + ' + num(r.wastePct, 0) + '% waste';
    resultNote.textContent = 'About ' + r.pavers + ' pavers, ' + num(r.baseCuYd, 1) + ' cu yd of gravel base (4"), and ' +
      num(r.sandCuYd, 1) + ' cu yd of bedding sand (1"). Order edging for the perimeter and polymeric sand for the joints.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to install about ' + num(r.areaSqFt, 0) + ' sq ft of paver patio';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function saveToHistory(r) {
    var h = getHistory();
    h.unshift({ areaSqFt: r.areaSqFt, wastePct: r.wastePct, pavers: r.pavers, timestamp: Date.now() });
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
      item.innerHTML = '<div class="history-input">' + escHtml(num(e.areaSqFt, 0) + ' sq ft · ' + num(e.wastePct, 0) + '% waste') + '</div>' +
        '<div class="history-meta"><span class="history-range">' + e.pavers + ' pavers</span><span class="history-date">' + escHtml(dateStr) + '</span></div>';
      function replay() {
        document.querySelector('input[name="area-mode"][value="sqft"]').checked = true; syncMode();
        sqftInput.value = e.areaSqFt; wasteInput.value = e.wastePct; calculate();
      }
      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') replay(); });
      historyList.appendChild(item);
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  Array.prototype.forEach.call(modeRadios, function (r) { r.addEventListener('change', syncMode); });
  [lengthInput, widthInput, sqftInput, paverLInput, paverWInput, wasteInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', function () { try { localStorage.removeItem(HISTORY_KEY); } catch {} renderHistory(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncMode(); renderHistory();
})();
