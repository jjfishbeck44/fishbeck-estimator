// public/js/drywall-calculator.js
// Client-side logic for the Drywall Calculator. Mirrors mulch-calculator.js.
// Pure math lives in js/calculators/drywall-math.js (FCalc.drywall).

(function () {
  'use strict';

  var math = (window.FCalc && window.FCalc.drywall) || null;

  // --- DOM refs ---
  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var roomGroup = document.getElementById('room-group');
  var areaGroup = document.getElementById('area-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var heightInput = document.getElementById('height-input');
  var ceilingCheckbox = document.getElementById('ceiling-checkbox');
  var areaInput = document.getElementById('area-input');
  var sheetSelect = document.getElementById('sheet-select');
  var wasteInput = document.getElementById('waste-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');

  var resultsCard = document.getElementById('results-card');
  var resultSheets = document.getElementById('result-sheets');
  var resultScrews = document.getElementById('result-screws');
  var resultCompound = document.getElementById('result-compound');
  var resultTape = document.getElementById('result-tape');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');

  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  // --- Constants ---
  var HISTORY_KEY = 'fishbeck_drywall_calcs';
  var MAX_HISTORY = 10;

  // --- Utilities (shared style with estimator.js) ---
  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }

  function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function num(n, decimals) {
    var d = typeof decimals === 'number' ? decimals : 1;
    return parseFloat(n.toFixed(d)).toLocaleString('en-US');
  }

  function getMode() {
    var checked = document.querySelector('input[name="area-mode"]:checked');
    return checked ? checked.value : 'room';
  }

  function syncMode() {
    if (getMode() === 'area') {
      hide(roomGroup);
      show(areaGroup);
    } else {
      show(roomGroup);
      hide(areaGroup);
    }
  }

  // Resolve the drywall area (sq ft) from whichever input mode is active.
  function resolveArea() {
    if (getMode() === 'area') {
      return math.toPositive(areaInput.value);
    }
    var walls = math.wallArea(lengthInput.value, widthInput.value, heightInput.value);
    var ceiling = ceilingCheckbox && ceilingCheckbox.checked
      ? math.ceilingArea(lengthInput.value, widthInput.value)
      : 0;
    return walls + ceiling;
  }

  // --- Calculate & render ---
  function calculate() {
    if (!math) return;
    hide(calcError);

    var area = resolveArea();
    if (area <= 0) {
      calcError.textContent = 'Enter your room size or total drywall area.';
      show(calcError);
      hide(resultsCard);
      hide(ctaCard);
      return;
    }

    var r = math.calculate({
      areaSqFt: area,
      sheetSqFt: sheetSelect.value,
      wastePct: wasteInput.value
    });

    renderResult(r);
    saveToHistory(r);
    renderHistory();
  }

  function renderResult(r) {
    resultSheets.textContent = r.sheets.toLocaleString('en-US');
    resultScrews.textContent = r.screws.toLocaleString('en-US');
    resultCompound.textContent = num(r.compoundGallons, 1);
    resultTape.textContent = r.tapeFeet.toLocaleString('en-US');
    resultArea.textContent = num(r.areaSqFt, 0) + ' sq ft, ' + num(r.wastePct, 0) + '% waste';

    resultNote.textContent =
      'Hang ' + r.sheets + ' ' + (r.sheets === 1 ? 'sheet' : 'sheets') + ', plan on about ' +
      r.screws.toLocaleString('en-US') + ' screws, ' + num(r.compoundGallons, 1) +
      ' gal of joint compound, and ' + r.tapeFeet.toLocaleString('en-US') +
      ' ft of tape. Compound and tape are rule-of-thumb estimates — round up to standard package sizes.';

    quoteLink.href = buildQuoteLink(r);

    show(resultsCard);
    show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to hang and finish about ' + num(r.areaSqFt, 0) +
      ' sq ft of drywall (~' + r.sheets + ' sheets)';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  // --- History (localStorage) ---
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
      sheetSqFt: r.sheetSqFt,
      wastePct: r.wastePct,
      sheets: r.sheets,
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
      var label = num(entry.areaSqFt, 0) + ' sq ft · ' + num(entry.sheetSqFt, 0) + ' sq ft sheets';

      item.innerHTML =
        '<div class="history-input">' + escHtml(label) + '</div>' +
        '<div class="history-meta">' +
          '<span class="history-range">' + entry.sheets + ' sheets</span>' +
          '<span class="history-date">' + escHtml(dateStr) + '</span>' +
        '</div>';

      function replay() {
        document.querySelector('input[name="area-mode"][value="area"]').checked = true;
        syncMode();
        areaInput.value = entry.areaSqFt;
        sheetSelect.value = String(entry.sheetSqFt);
        wasteInput.value = entry.wastePct;
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

  [lengthInput, widthInput, heightInput, areaInput, wasteInput].forEach(function (el) {
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
