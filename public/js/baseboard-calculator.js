// public/js/baseboard-calculator.js — IIFE UI for the Baseboard / Trim Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.baseboard) || null;

  var modeRadios = document.querySelectorAll('input[name="area-mode"]');
  var dimsGroup = document.getElementById('dims-group');
  var perimGroup = document.getElementById('perim-group');
  var lengthInput = document.getElementById('length-input');
  var widthInput = document.getElementById('width-input');
  var perimInput = document.getElementById('perim-input');
  var doorsInput = document.getElementById('doors-input');
  var wasteInput = document.getElementById('waste-input');
  var stockSelect = document.getElementById('stock-select');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultPieces = document.getElementById('result-pieces');
  var resultFeet = document.getElementById('result-feet');
  var resultNet = document.getElementById('result-net');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  var HISTORY_KEY = 'fishbeck_baseboard_calcs';
  var MAX_HISTORY = 10;

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function num(n, dec) { return parseFloat(n.toFixed(typeof dec === 'number' ? dec : 1)).toLocaleString('en-US'); }
  function getMode() { var c = document.querySelector('input[name="area-mode"]:checked'); return c ? c.value : 'dims'; }
  function syncMode() { if (getMode() === 'perim') { hide(dimsGroup); show(perimGroup); } else { show(dimsGroup); hide(perimGroup); } }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var opts = { doors: doorsInput.value, wastePct: wasteInput.value, stockFt: stockSelect.value };
    if (getMode() === 'perim') opts.perimeterFt = perimInput.value;
    else { opts.lengthFt = lengthInput.value; opts.widthFt = widthInput.value; }
    var r = math.calculate(opts);
    if (r.perimeterFt <= 0) { calcError.textContent = 'Enter the room size or the total perimeter to trim.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    renderResult(r); saveToHistory(r); renderHistory();
  }

  function renderResult(r) {
    resultPieces.textContent = r.pieces.toLocaleString('en-US');
    resultFeet.textContent = num(r.feetWithWaste, 0);
    resultNet.textContent = num(r.netFeet, 0);
    resultArea.textContent = num(r.perimeterFt, 0) + ' ft perimeter, ' + r.doors + ' ' + (r.doors === 1 ? 'door' : 'doors') + ' deducted';
    resultNote.textContent = 'Buy ' + r.pieces + ' ' + (r.pieces === 1 ? 'piece' : 'pieces') + ' of ' + num(r.stockFt, 0) +
      ' ft trim (' + num(r.feetWithWaste, 0) + ' ft with waste). Buy a little long — miters and scarf joints eat material.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to install about ' + num(r.netFeet, 0) + ' linear feet of baseboard/trim';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function saveToHistory(r) {
    var h = getHistory();
    h.unshift({ perimeterFt: r.perimeterFt, doors: r.doors, wastePct: r.wastePct, stockFt: r.stockFt, pieces: r.pieces, timestamp: Date.now() });
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
      item.innerHTML = '<div class="history-input">' + escHtml(num(e.perimeterFt, 0) + ' ft · ' + e.doors + ' doors') + '</div>' +
        '<div class="history-meta"><span class="history-range">' + e.pieces + ' pieces</span><span class="history-date">' + escHtml(dateStr) + '</span></div>';
      function replay() {
        document.querySelector('input[name="area-mode"][value="perim"]').checked = true; syncMode();
        perimInput.value = e.perimeterFt; doorsInput.value = e.doors; wasteInput.value = e.wastePct; stockSelect.value = String(e.stockFt); calculate();
      }
      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') replay(); });
      historyList.appendChild(item);
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  Array.prototype.forEach.call(modeRadios, function (r) { r.addEventListener('change', syncMode); });
  [lengthInput, widthInput, perimInput, doorsInput, wasteInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', function () { try { localStorage.removeItem(HISTORY_KEY); } catch {} renderHistory(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  syncMode(); renderHistory();
})();
