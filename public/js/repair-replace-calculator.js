// public/js/repair-replace-calculator.js — IIFE UI for Repair vs Replace.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.repairReplace) || null;

  var systemSelect = document.getElementById('system-select');
  var ageInput = document.getElementById('age-input');
  var conditionSelect = document.getElementById('condition-select');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultRec = document.getElementById('result-rec');
  var resultRepair = document.getElementById('result-repair');
  var resultReplace = document.getElementById('result-replace');
  var resultLife = document.getElementById('result-life');
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
    var r = math.calculate({ system: systemSelect.value, ageYears: ageInput.value, condition: conditionSelect.value });
    if (!r.valid) { calcError.textContent = 'Pick a system to evaluate.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    resultRec.textContent = r.recommendation === 'replace' ? 'Replace' : 'Repair';
    resultRepair.textContent = range(r.repairLow, r.repairHigh);
    resultReplace.textContent = range(r.replaceLow, r.replaceHigh);
    resultLife.textContent = r.percentOfLifeUsed + '%';
    resultArea.textContent = r.label + ' · ' + r.ageYears + ' yrs · ' + r.condition + ' condition';
    resultNote.textContent = r.reason + ' Typical service life is about ' + r.lifespanYears + ' years.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I have a ' + r.label.toLowerCase() + ' about ' + r.ageYears + ' years old in ' + r.condition +
      ' condition — I’d like a quote to ' + r.recommendation + ' it';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (ageInput) ageInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); });
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
