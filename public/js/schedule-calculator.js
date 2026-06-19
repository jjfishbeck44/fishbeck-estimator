// public/js/schedule-calculator.js — IIFE UI for the Project Schedule & Price tool.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.schedule) || null;

  var svcBoxes = document.querySelectorAll('.svc-item');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultTotal = document.getElementById('result-total');
  var resultDays = document.getElementById('result-days');
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

  function selected() {
    return Array.prototype.filter.call(svcBoxes, function (b) { return b.checked; }).map(function (b) { return b.value; });
  }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var ids = selected();
    if (ids.length === 0) { calcError.textContent = 'Select the services your project needs.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    var r = math.calculate({ serviceIds: ids });
    resultTotal.textContent = range(r.low, r.high);
    resultDays.textContent = '~' + r.calendarDays + (r.calendarDays === 1 ? ' day' : ' days');
    resultCount.textContent = r.selected.length + ' ' + (r.selected.length === 1 ? 'service' : 'services');
    resultBreakdown.innerHTML = '';
    r.selected.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'breakdown-row';
      li.innerHTML = '<span>' + escHtml(s.label) + '</span><span class="breakdown-range">' + range(s.low, s.high) + '</span>';
      resultBreakdown.appendChild(li);
    });
    resultNote.textContent = 'Estimated ' + range(r.low, r.high) + ' over roughly ' + r.calendarDays +
      ' working days (crews overlap some tasks). A firm quote and schedule come after a walkthrough.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var labels = r.selected.map(function (s) { return s.label.toLowerCase(); }).join(', ');
    var msg = 'I’m planning a project that includes: ' + labels + '. I’d like a quote and timeline';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
