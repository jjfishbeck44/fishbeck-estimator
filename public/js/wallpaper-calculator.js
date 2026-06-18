// public/js/wallpaper-calculator.js — IIFE UI for the Wallpaper Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.wallpaper) || null;

  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var roomGroup = document.getElementById('room-group');
  var areaGroup = document.getElementById('area-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var heightInput = document.getElementById('height-input');
  var wallareaInput = document.getElementById('wallarea-input');
  var doorsInput = document.getElementById('doors-input');
  var windowsInput = document.getElementById('windows-input');
  var wasteInput = document.getElementById('waste-input');
  var rollInput = document.getElementById('roll-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultRolls = document.getElementById('result-rolls');
  var resultNet = document.getElementById('result-net');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  var HISTORY_KEY = 'fishbeck_wallpaper_calcs';
  var MAX_HISTORY = 10;

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function num(n, dec) { return parseFloat(n.toFixed(typeof dec === 'number' ? dec : 1)).toLocaleString('en-US'); }
  function getMode() { var c = document.querySelector('input[name="area-mode"]:checked'); return c ? c.value : 'room'; }
  function syncMode() { if (getMode() === 'area') { hide(roomGroup); show(areaGroup); } else { show(roomGroup); hide(areaGroup); } }
  function resolveWallArea() { return getMode() === 'area' ? math.toPositive(wallareaInput.value) : math.wallAreaFromRoom(lengthInput.value, widthInput.value, heightInput.value); }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var wallArea = resolveWallArea();
    if (wallArea <= 0) { calcError.textContent = 'Enter the room size or total wall area.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ wallAreaSqFt: wallArea, doors: doorsInput.value, windows: windowsInput.value, wastePct: wasteInput.value, rollSqFt: rollInput.value });
    if (r.netArea <= 0) { calcError.textContent = 'Door/window deductions exceed the wall area. Check the numbers.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    renderResult(r); saveToHistory(r); renderHistory();
  }

  function renderResult(r) {
    resultRolls.textContent = r.rolls.toLocaleString('en-US');
    resultNet.textContent = num(r.netArea, 0);
    resultArea.textContent = num(r.netArea, 0) + ' sq ft to cover + ' + num(r.wastePct, 0) + '% pattern waste';
    resultNote.textContent = 'Buy ' + r.rolls + ' single ' + (r.rolls === 1 ? 'roll' : 'rolls') + ' (~' + num(r.rollSqFt, 0) +
      ' sq ft usable each). Large pattern repeats need more — buy all from the same batch/run number.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to hang wallpaper over about ' + num(r.netArea, 0) + ' sq ft of walls';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function saveToHistory(r) {
    var h = getHistory();
    h.unshift({ netArea: r.netArea, wastePct: r.wastePct, rollSqFt: r.rollSqFt, rolls: r.rolls, timestamp: Date.now() });
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
      item.innerHTML = '<div class="history-input">' + escHtml(num(e.netArea, 0) + ' sq ft · ' + num(e.wastePct, 0) + '% waste') + '</div>' +
        '<div class="history-meta"><span class="history-range">' + e.rolls + ' rolls</span><span class="history-date">' + escHtml(dateStr) + '</span></div>';
      function replay() {
        document.querySelector('input[name="area-mode"][value="area"]').checked = true; syncMode();
        wallareaInput.value = e.netArea; doorsInput.value = 0; windowsInput.value = 0; wasteInput.value = e.wastePct; rollInput.value = e.rollSqFt; calculate();
      }
      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') replay(); });
      historyList.appendChild(item);
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  Array.prototype.forEach.call(modeRadios, function (r) { r.addEventListener('change', syncMode); });
  [lengthInput, widthInput, heightInput, wallareaInput, doorsInput, windowsInput, wasteInput, rollInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', function () { try { localStorage.removeItem(HISTORY_KEY); } catch {} renderHistory(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncMode(); renderHistory();
})();
