// public/js/flip-calculator.js — IIFE UI for the Fix-n-Flip ROI Calculator.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.flip) || null;

  var purchaseInput = document.getElementById('purchase-input');
  var rehabInput = document.getElementById('rehab-input');
  var arvInput = document.getElementById('arv-input');
  var cityInput = document.getElementById('city-input');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultProfit = document.getElementById('result-profit');
  var resultRoi = document.getElementById('result-roi');
  var resultInvested = document.getElementById('result-invested');
  var resultMaxoffer = document.getElementById('result-maxoffer');
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
    var r = math.calculate({ purchase: purchaseInput.value, rehab: rehabInput.value, arv: arvInput.value });
    if (r.arv <= 0 || r.purchase <= 0) { calcError.textContent = 'Enter at least a purchase price and an after-repair value (ARV).'; show(calcError); hide(resultsCard); hide(ctaCard); return; }
    resultProfit.textContent = money(r.profit);
    resultRoi.textContent = r.roiPct + '%';
    resultInvested.textContent = money(r.totalInvested);
    resultMaxoffer.textContent = money(r.maxOffer70);
    resultArea.textContent = 'ARV ' + money(r.arv) + ' · rehab ' + money(r.rehab);
    resultNote.textContent = 'Projected profit of ' + money(r.profit) + ' (' + r.roiPct + '% ROI) after ~' +
      money(r.sellingCost) + ' selling and ' + money(r.holdingCost) + ' holding costs. The 70% rule suggests offering at most ' +
      money(r.maxOffer70) + ' for this deal.';
    quoteLink.href = buildQuoteLink(r);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function buildQuoteLink(r) {
    var city = (cityInput.value || '').trim();
    var msg = 'I’m planning a fix-n-flip — purchase ~' + money(r.purchase) + ', rehab budget ~' + money(r.rehab) +
      ', ARV ~' + money(r.arv) + '. I’d like a rehab scope and estimate';
    if (city) msg += ' in ' + city;
    msg += '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  [purchaseInput, rehabInput, arvInput].forEach(function (el) { if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); }); });
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
