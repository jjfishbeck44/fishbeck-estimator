// public/js/salt-calculator.js — IIFE UI for the Parking-Lot De-Icing Salt Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.salt) || null;

  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var dimsGroup = document.getElementById('dims-group');
  var sqftGroup = document.getElementById('sqft-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var sqftInput = document.getElementById('sqft-input');
  var rateInput = document.getElementById('rate-input');
  var appsInput = document.getElementById('apps-input');
  var bagInput = document.getElementById('bag-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultBags = document.getElementById('result-bags');
  var resultLbs = document.getElementById('result-lbs');
  var resultPerApp = document.getElementById('result-perapp');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  var HISTORY_KEY = 'fishbeck_salt_calcs';
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
    if (area <= 0) { calcError.textContent = 'Enter the lot size or total square footage.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ areaSqFt: area, lbsPer1000: rateInput.value, applications: appsInput.value, bagLbs: bagInput.value });
    renderResult(r); saveToHistory(r); renderHistory();
  }

  function renderResult(r) {
    resultBags.textContent = r.bags.toLocaleString('en-US');
    resultLbs.textContent = num(r.saltLbs, 0);
    resultPerApp.textContent = num(r.saltLbsPerApplication, 0);
    resultArea.textContent = num(r.areaSqFt, 0) + ' sq ft × ' + num(r.applications, 0) + ' application' + (r.applications === 1 ? '' : 's');
    resultNote.textContent = 'Plan on about ' + num(r.saltLbs, 0) + ' lbs total (' + r.bags + ' bags of ' + num(r.bagLbs, 0) +
      ' lb). Rock salt loses effectiveness below ~15°F — switch to a blended ice-melt in deep cold.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote for winter de-icing / salting on about ' + num(r.areaSqFt, 0) + ' sq ft of lot';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function saveToHistory(r) {
    var h = getHistory();
    h.unshift({ areaSqFt: r.areaSqFt, lbsPer1000: r.lbsPer1000, applications: r.applications, bagLbs: r.bagLbs, bags: r.bags, timestamp: Date.now() });
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
      item.innerHTML = '<div class="history-input">' + escHtml(num(e.areaSqFt, 0) + ' sq ft · ' + num(e.applications, 0) + ' apps') + '</div>' +
        '<div class="history-meta"><span class="history-range">' + e.bags + ' bags</span><span class="history-date">' + escHtml(dateStr) + '</span></div>';
      function replay() {
        document.querySelector('input[name="area-mode"][value="sqft"]').checked = true; syncMode();
        sqftInput.value = e.areaSqFt; rateInput.value = e.lbsPer1000; appsInput.value = e.applications; bagInput.value = e.bagLbs; calculate();
      }
      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') replay(); });
      historyList.appendChild(item);
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  Array.prototype.forEach.call(modeRadios, function (r) { r.addEventListener('change', syncMode); });
  [lengthInput, widthInput, sqftInput, rateInput, appsInput, bagInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', function () { try { localStorage.removeItem(HISTORY_KEY); } catch {} renderHistory(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncMode(); renderHistory();
})();
