// public/js/mulch-calculator.js
// Client-side logic for the Mulch / Material Calculator.
// Mirrors the patterns in estimator.js (IIFE, escHtml, localStorage history,
// footer year). Pure math lives in js/calculators/mulch-math.js (FCalc.mulch).

(function () {
  'use strict';

  var math = (window.FCalc && window.FCalc.mulch) || null;

  // --- DOM refs ---
  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var dimsGroup = document.getElementById('dims-group');
  var sqftGroup = document.getElementById('sqft-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var sqftInput = document.getElementById('sqft-input');
  var depthInput = document.getElementById('depth-input');
  var bagSelect = document.getElementById('bag-select');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');

  var resultsCard = document.getElementById('results-card');
  var resultYards = document.getElementById('result-yards');
  var resultBulk = document.getElementById('result-bulk');
  var resultBags = document.getElementById('result-bags');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');

  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  // --- Constants ---
  var HISTORY_KEY = 'fishbeck_mulch_calcs';
  var MAX_HISTORY = 10;

  // --- Utilities (shared style with estimator.js) ---
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // Trim trailing zeros from a fixed-decimal number ("3.0" -> "3").
  function num(n, decimals) {
    var d = typeof decimals === 'number' ? decimals : 1;
    return parseFloat(n.toFixed(d)).toLocaleString('en-US');
  }

  function getMode() {
    var checked = document.querySelector('input[name="area-mode"]:checked');
    return checked ? checked.value : 'dims';
  }

  function syncMode() {
    if (getMode() === 'sqft') {
      hide(dimsGroup);
      show(sqftGroup);
    } else {
      show(dimsGroup);
      hide(sqftGroup);
    }
  }

  // Resolve the bed area (sq ft) from whichever input mode is active.
  function resolveArea() {
    if (getMode() === 'sqft') {
      return math.toPositive(sqftInput.value);
    }
    return math.areaFromRectangle(lengthInput.value, widthInput.value);
  }

  // --- Calculate & render ---
  function calculate() {
    if (!math) return;
    hide(calcError);

    var area = resolveArea();
    var depth = math.toPositive(depthInput.value);
    var bagCuFt = math.toPositive(bagSelect.value);

    if (area <= 0 || depth <= 0) {
      calcError.textContent = 'Enter your bed size and a mulch depth greater than zero.';
      show(calcError);
      hide(resultsCard);
      hide(ctaCard);
      return;
    }

    var r = math.calculate({ areaSqFt: area, depthInches: depth, bagCuFt: bagCuFt });
    renderResult(r);
    saveToHistory(r);
    renderHistory();
  }

  function renderResult(r) {
    resultYards.textContent = num(r.cubicYardsRounded, 1);
    resultBulk.textContent = r.bulkYardsToOrder.toLocaleString('en-US');
    resultBags.textContent = r.bagsToOrder.toLocaleString('en-US');
    resultArea.textContent = num(r.areaSqFt, 0) + ' sq ft at ' + num(r.depthInches, 1) + '" deep';

    resultNote.textContent =
      'Order ' + r.bulkYardsToOrder + ' cubic ' + (r.bulkYardsToOrder === 1 ? 'yard' : 'yards') +
      ' of bulk mulch, or about ' + r.bagsToOrder + ' bags (' + num(r.bagCuFt, 1) +
      ' cu ft each). We round up so you don’t come up short.';

    quoteLink.href = buildQuoteLink(r);

    show(resultsCard);
    show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Build a "/?prefill=..." link that hands the project to the AI estimator.
  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to supply and install about ' + r.bulkYardsToOrder +
      ' cubic yards of mulch — roughly ' + num(r.areaSqFt, 0) + ' sq ft of beds at ' +
      num(r.depthInches, 1) + '" deep';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  // --- History (localStorage), same pattern as estimator.js ---
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveToHistory(r) {
    var history = getHistory();
    history.unshift({
      areaSqFt: r.areaSqFt,
      depthInches: r.depthInches,
      bagCuFt: r.bagCuFt,
      cubicYardsRounded: r.cubicYardsRounded,
      bulkYardsToOrder: r.bulkYardsToOrder,
      timestamp: Date.now()
    });
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // localStorage full or unavailable
    }
  }

  function renderHistory() {
    var history = getHistory();
    if (history.length === 0) {
      hide(historyCard);
      return;
    }
    show(historyCard);
    historyList.innerHTML = '';
    history.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'history-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      var date = new Date(entry.timestamp);
      var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      var label = num(entry.areaSqFt, 0) + ' sq ft @ ' + num(entry.depthInches, 1) + '"';

      item.innerHTML =
        '<div class="history-input">' + escHtml(label) + '</div>' +
        '<div class="history-meta">' +
          '<span class="history-range">' + num(entry.cubicYardsRounded, 1) + ' cu yd</span>' +
          '<span class="history-date">' + escHtml(dateStr) + '</span>' +
        '</div>';

      function replay() {
        document.querySelector('input[name="area-mode"][value="sqft"]').checked = true;
        syncMode();
        sqftInput.value = entry.areaSqFt;
        depthInput.value = entry.depthInches;
        bagSelect.value = String(entry.bagCuFt);
        calculate();
      }

      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') replay();
      });

      historyList.appendChild(item);
    });
  }

  // --- Event listeners ---
  if (calcBtn) calcBtn.addEventListener('click', calculate);

  Array.prototype.forEach.call(modeRadios, function (radio) {
    radio.addEventListener('change', syncMode);
  });

  // Enter on any numeric input triggers a calculation.
  [lengthInput, widthInput, sqftInput, depthInput].forEach(function (el) {
    if (!el) return;
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') calculate();
    });
  });

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', function () {
      try { localStorage.removeItem(HISTORY_KEY); } catch {}
      renderHistory();
    });
  }

  // --- Init ---
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncMode();
  renderHistory();

})();
