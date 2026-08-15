// public/js/paint-calculator.js
// Client-side logic for the Paint Calculator. Mirrors mulch-calculator.js.
// Pure math lives in js/calculators/paint-math.js (FCalc.paint).

(function () {
  'use strict';

  var math = (window.FCalc && window.FCalc.paint) || null;

  // --- DOM refs ---
  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var roomGroup = document.getElementById('room-group');
  var areaGroup = document.getElementById('area-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var heightInput = document.getElementById('height-input');
  var wallareaInput = document.getElementById('wallarea-input');
  var doorsInput = document.getElementById('doors-input');
  var windowsInput = document.getElementById('windows-input');
  var coatsInput = document.getElementById('coats-input');
  var coverageInput = document.getElementById('coverage-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');

  var resultsCard = document.getElementById('results-card');
  var resultGallons = document.getElementById('result-gallons');
  var resultRaw = document.getElementById('result-raw');
  var resultPaintable = document.getElementById('result-paintable');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');

  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  // --- Constants ---
  var HISTORY_KEY = 'fishbeck_paint_calcs';
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

  // Resolve the wall area (sq ft) from whichever input mode is active.
  function resolveWallArea() {
    if (getMode() === 'area') {
      return math.toPositive(wallareaInput.value);
    }
    return math.wallAreaFromRoom(lengthInput.value, widthInput.value, heightInput.value);
  }

  // --- Calculate & render ---
  function calculate() {
    if (!math) return;
    hide(calcError);

    var wallArea = resolveWallArea();
    if (wallArea <= 0) {
      calcError.textContent = 'Enter your room size or total wall area to paint.';
      show(calcError);
      hide(resultsCard);
      hide(ctaCard);
      return;
    }

    var r = math.calculate({
      wallAreaSqFt: wallArea,
      doors: doorsInput.value,
      windows: windowsInput.value,
      coats: coatsInput.value,
      coveragePerGallon: coverageInput.value
    });

    if (r.paintableArea <= 0) {
      calcError.textContent = 'Your door/window deductions are larger than the wall area. Double-check the numbers.';
      show(calcError);
      hide(resultsCard);
      hide(ctaCard);
      return;
    }

    renderResult(r);
    saveToHistory(r);
    renderHistory();
  }

  function renderResult(r) {
    resultGallons.textContent = r.gallonsToBuy.toLocaleString('en-US');
    resultRaw.textContent = num(r.gallonsRounded, 1);
    resultPaintable.textContent = num(r.paintableArea, 0);
    resultArea.textContent = num(r.paintableArea, 0) + ' sq ft to paint, ' + num(r.coats, 0) +
      (r.coats === 1 ? ' coat' : ' coats');

    resultNote.textContent =
      'Buy ' + r.gallonsToBuy + ' ' + (r.gallonsToBuy === 1 ? 'gallon' : 'gallons') +
      ' to cover ' + num(r.paintableArea, 0) + ' sq ft with ' + num(r.coats, 0) +
      (r.coats === 1 ? ' coat' : ' coats') + ' at ' + num(r.coveragePerGallon, 0) +
      ' sq ft/gallon. A primer coat or deep color change may need more.';

    quoteLink.href = buildQuoteLink(r);

    show(resultsCard);
    show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to paint about ' + num(r.paintableArea, 0) +
      ' sq ft of walls (' + num(r.coats, 0) + (r.coats === 1 ? ' coat' : ' coats') + ')';
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
      paintableArea: r.paintableArea,
      coats: r.coats,
      coveragePerGallon: r.coveragePerGallon,
      gallonsToBuy: r.gallonsToBuy,
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
      var label = num(entry.paintableArea, 0) + ' sq ft · ' + num(entry.coats, 0) +
        (entry.coats === 1 ? ' coat' : ' coats');

      item.innerHTML =
        '<div class="history-input">' + escHtml(label) + '</div>' +
        '<div class="history-meta">' +
          '<span class="history-range">' + entry.gallonsToBuy + ' gal</span>' +
          '<span class="history-date">' + escHtml(dateStr) + '</span>' +
        '</div>';

      function replay() {
        document.querySelector('input[name="area-mode"][value="area"]').checked = true;
        syncMode();
        // History stores the *net* paintable area, so clear deductions on replay.
        wallareaInput.value = entry.paintableArea;
        doorsInput.value = 0;
        windowsInput.value = 0;
        coatsInput.value = entry.coats;
        coverageInput.value = entry.coveragePerGallon;
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

  [lengthInput, widthInput, heightInput, wallareaInput, doorsInput, windowsInput, coatsInput, coverageInput].forEach(function (el) {
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
