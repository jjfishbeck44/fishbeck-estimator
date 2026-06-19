// public/js/tool-rental-calculator.js — IIFE UI for the Tool Rental Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.toolRental) || null;

  var toolSelect = document.getElementById('tool-select');
  var hoursInput = document.getElementById('hours-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultCost = document.getElementById('result-cost');
  var resultRate = document.getElementById('result-rate');
  var resultHours = document.getElementById('result-hours');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var footerYear = document.getElementById('footer-year');

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var r = math.calculate({ toolKey: toolSelect.value, hours: hoursInput.value });
    if (!r.valid) { calcError.textContent = 'Pick a tool and enter the number of hours.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    resultCost.textContent = money(r.cost);
    resultRate.textContent = money(r.perHour) + '/hr';
    resultHours.textContent = r.hours.toLocaleString('en-US');
    resultArea.textContent = r.label + ' · ' + r.hours + (r.hours === 1 ? ' hour' : ' hours');
    resultNote.textContent = 'Estimated rental: ' + money(r.cost) + ' for the ' + r.label.toLowerCase() + ' at ' +
      money(r.perHour) + '/hr. Multi-day or weekly rates may be available — ask us.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like to rent your ' + r.label.toLowerCase() + ' for about ' + r.hours + ' hours';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (hoursInput) hoursInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); });
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
