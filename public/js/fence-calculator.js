// public/js/fence-calculator.js — IIFE UI for the Fence Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.fence) || null;

  var lengthInput = document.getElementById('length-input');
  var spacingInput = document.getElementById('spacing-input');
  var railsSelect = document.getElementById('rails-select');
  var bagsInput = document.getElementById('bags-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultPosts = document.getElementById('result-posts');
  var resultSections = document.getElementById('result-sections');
  var resultRails = document.getElementById('result-rails');
  var resultConcrete = document.getElementById('result-concrete');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var footerYear = document.getElementById('footer-year');

  var HISTORY_KEY = 'fishbeck_fence_calcs';
  var MAX_HISTORY = 10;

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function num(n, dec) { return parseFloat(n.toFixed(typeof dec === 'number' ? dec : 1)).toLocaleString('en-US'); }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var len = math.toPositive(lengthInput.value);
    if (len <= 0) { calcError.textContent = 'Enter the total fence length in feet.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ lengthFt: len, postSpacingFt: spacingInput.value, railsPerSection: railsSelect.value, concreteBagsPerPost: bagsInput.value });
    renderResult(r); saveToHistory(r); renderHistory();
  }

  function renderResult(r) {
    resultPosts.textContent = r.posts.toLocaleString('en-US');
    resultSections.textContent = r.sections.toLocaleString('en-US');
    resultRails.textContent = r.rails.toLocaleString('en-US');
    resultConcrete.textContent = r.concreteBags.toLocaleString('en-US');
    resultArea.textContent = num(r.lengthFt, 0) + ' ft, posts ' + num(r.postSpacingFt, 0) + ' ft apart';
    resultNote.textContent = r.posts + ' posts, ' + r.sections + ' sections, ' + r.rails + ' rails, and about ' +
      r.concreteBags + ' bags of concrete. Add an extra post for each gate or corner.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote to install about ' + num(r.lengthFt, 0) + ' linear feet of fence (' + r.posts + ' posts)';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; } }
  function saveToHistory(r) {
    var h = getHistory();
    h.unshift({ lengthFt: r.lengthFt, postSpacingFt: r.postSpacingFt, railsPerSection: r.railsPerSection, posts: r.posts, timestamp: Date.now() });
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
      item.innerHTML = '<div class="history-input">' + escHtml(num(e.lengthFt, 0) + ' ft @ ' + num(e.postSpacingFt, 0) + ' ft spacing') + '</div>' +
        '<div class="history-meta"><span class="history-range">' + e.posts + ' posts</span><span class="history-date">' + escHtml(dateStr) + '</span></div>';
      function replay() {
        lengthInput.value = e.lengthFt; spacingInput.value = e.postSpacingFt; railsSelect.value = String(e.railsPerSection); calculate();
      }
      item.addEventListener('click', replay);
      item.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') replay(); });
      historyList.appendChild(item);
    });
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  [lengthInput, spacingInput, bagsInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', function () { try { localStorage.removeItem(HISTORY_KEY); } catch {} renderHistory(); });

  if (footerYear) footerYear.textContent = new Date().getFullYear();
  renderHistory();
})();
