// public/js/diy-calculator.js — IIFE UI for the DIY vs Hire Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.diy) || null;

  var materialInput = document.getElementById('material-input');
  var hoursInput = document.getElementById('hours-input');
  var timevalueInput = document.getElementById('timevalue-input');
  var proquoteInput = document.getElementById('proquote-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultRec = document.getElementById('result-rec');
  var resultDiy = document.getElementById('result-diy');
  var resultSavings = document.getElementById('result-savings');
  var resultCash = document.getElementById('result-cash');
  var resultArea = document.getElementById('result-area');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var footerYear = document.getElementById('footer-year');

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function money(n) { return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); }

  function calculate() {
    if (!math) return;
    hide(calcError);
    var r = math.calculate({ materialCost: materialInput.value, hours: hoursInput.value, timeValuePerHour: timevalueInput.value, proQuote: proquoteInput.value });
    if (r.proQuote <= 0 && r.materialCost <= 0) { calcError.textContent = 'Enter your material cost and a pro quote to compare.'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    resultRec.textContent = r.trueSavings > 0 ? 'DIY' : 'Hire';
    resultDiy.textContent = money(r.diyTrueCost);
    resultSavings.textContent = money(r.trueSavings);
    resultCash.textContent = money(r.cashSavings);
    resultArea.textContent = money(r.materialCost) + ' materials · ' + r.hours + ' hrs @ ' + money(r.timeValuePerHour) + '/hr';
    resultNote.textContent = 'DIY really costs about ' + money(r.diyTrueCost) + ' once you value your ' + r.hours +
      ' hours. Versus a ' + money(r.proQuote) + ' pro quote, that’s ' + money(r.trueSavings) +
      ' counting your time (' + money(r.cashSavings) + ' out-of-pocket). Recommendation: ' + r.recommendation + '.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’m weighing DIY vs hiring a pro for a project (about ' + money(r.materialCost) + ' in materials, ~' +
      r.hours + ' hours of work). I’d like a quote';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  [materialInput, hoursInput, timevalueInput, proquoteInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
