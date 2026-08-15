// public/js/snow-calculator.js — IIFE UI for the Snow Removal Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.snow) || null;

  var tierSelect = document.getElementById('tier-select');
  var visitsInput = document.getElementById('visits-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultSeason = document.getElementById('result-season');
  var resultPervisit = document.getElementById('result-pervisit');
  var resultVisits = document.getElementById('result-visits');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var footerYear = document.getElementById('footer-year');

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function range(lo, hi) { return money(lo) + '–' + money(hi); }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var r = math.calculate({ tierKey: tierSelect.value, visits: visitsInput.value });
    if (!r.valid) { calcError.textContent = 'Pick a property type to estimate.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    resultSeason.textContent = range(r.seasonLow, r.seasonHigh);
    resultPervisit.textContent = range(r.perVisitLow, r.perVisitHigh);
    resultVisits.textContent = r.visits.toLocaleString('en-US');
    resultArea.textContent = r.label;
    resultNote.textContent = 'A typical Twin Cities winter runs about ' + r.visits + ' plowable events. At ' +
      range(r.perVisitLow, r.perVisitHigh) + ' per visit, plan on roughly ' + range(r.seasonLow, r.seasonHigh) +
      ' for the season. Seasonal flat-rate contracts are also available.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’d like a quote for snow removal — ' + r.label.toLowerCase() + ' (~' + r.visits + ' visits/season)';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (visitsInput) visitsInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); });
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
