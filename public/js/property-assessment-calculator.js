// public/js/property-assessment-calculator.js — IIFE UI for Property Assessment.
// Calls /api/travel-distance to geocode the address, then prices locally.
(function () {
  'use strict';
  var math = (window.FCalc && window.FCalc.propertyAssessment) || null;

  var addressInput = document.getElementById('address-input');
  var optionBoxes = document.querySelectorAll('.assess-item');
  var calcBtn = document.getElementById('calc-btn');
  var calcError = document.getElementById('calc-error');
  var resultsCard = document.getElementById('results-card');
  var resultTotal = document.getElementById('result-total');
  var resultTravel = document.getElementById('result-travel');
  var resultBase = document.getElementById('result-base');
  var resultDistance = document.getElementById('result-distance');
  var resultBreakdown = document.getElementById('result-breakdown');
  var resultNote = document.getElementById('result-note');
  var ctaCard = document.getElementById('cta-card');
  var quoteLink = document.getElementById('quote-link');
  var footerYear = document.getElementById('footer-year');

  function show(el) { if (el) el.classList.remove('hidden'); }
  function hide(el) { if (el) el.classList.add('hidden'); }
  function escHtml(s) { var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML; }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function selectedOptions() {
    return Array.prototype.filter.call(optionBoxes, function (b) { return b.checked; }).map(function (b) { return b.value; });
  }

  function setLoading(on) {
    calcBtn.disabled = on;
    calcBtn.querySelector('.btn-text').textContent = on ? 'Looking up address…' : 'Estimate Assessment';
  }

  async function calculate() {
    if (!math) return;
    hide(calcError);
    var address = (addressInput.value || '').trim();
    if (!address) { calcError.textContent = 'Enter the property address (street, city, state).'; show(calcError); hide(resultsCard); hide(ctaCard); return; }

    setLoading(true);
    var miles, displayName;
    try {
      var resp = await fetch('/api/travel-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address })
      });
      var data = await resp.json();
      if (!resp.ok) {
        calcError.textContent = data.message || 'We couldn’t look up that address. Please try again.';
        show(calcError); hide(resultsCard); hide(ctaCard); setLoading(false); return;
      }
      miles = data.miles; displayName = data.displayName;
    } catch (e) {
      calcError.textContent = 'Address lookup is unavailable right now. Please try again or contact us directly.';
      show(calcError); hide(resultsCard); hide(ctaCard); setLoading(false); return;
    }
    setLoading(false);

    var r = math.calculate({ distanceMiles: miles, options: selectedOptions() });
    render(r, displayName);
  }

  function render(r, displayName) {
    resultTotal.textContent = money(r.total);
    resultTravel.textContent = money(r.travelCost);
    resultBase.textContent = money(r.baseFee);
    resultDistance.textContent = (displayName ? displayName.split(',')[0] + ' · ' : '') + r.distanceMiles + ' mi from St. Paul';

    resultBreakdown.innerHTML = '';
    addRow('Base assessment', r.baseFee);
    addRow('Travel (' + r.distanceMiles + ' mi round-trip beyond ' + r.freeRadiusMiles + ' mi free)', r.travelCost);
    r.selected.forEach(function (s) { addRow(s.label, s.price); });

    resultNote.textContent = 'Estimated assessment cost: ' + money(r.total) + '. Travel is only charged beyond ' +
      r.freeRadiusMiles + ' miles of St. Paul. Book below and we’ll confirm a time.';
    quoteLink.href = buildQuoteLink(r, displayName);
    show(resultsCard); show(ctaCard);
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addRow(label, amount) {
    var li = document.createElement('li');
    li.className = 'breakdown-row';
    li.innerHTML = '<span>' + escHtml(label) + '</span><span class="breakdown-range">' + money(amount) + '</span>';
    resultBreakdown.appendChild(li);
  }

  function buildQuoteLink(r, displayName) {
    var scope = r.selected.map(function (s) { return s.label.toLowerCase(); });
    var msg = 'I’d like to book a property assessment' + (displayName ? ' at ' + displayName.split(',').slice(0, 2).join(',') : '') + '.';
    if (scope.length) msg += ' Please include: ' + scope.join(', ') + '.';
    return '/?prefill=' + encodeURIComponent(msg);
  }

  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (addressInput) addressInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') calculate(); });
  if (footerYear) footerYear.textContent = new Date().getFullYear();
})();
