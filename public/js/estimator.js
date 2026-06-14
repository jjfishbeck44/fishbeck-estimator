// public/js/estimator.js
// Client-side logic for the Fishbeck Project Estimator
// Handles: form interaction, API call, result rendering, state management

(function () {
  'use strict';

  // --- DOM refs ---
  const textarea = document.getElementById('project-input');
  const charCount = document.getElementById('char-count');
  const estimateBtn = document.getElementById('estimate-btn');
  const inputCard = document.getElementById('input-card');
  const loadingCard = document.getElementById('loading-card');
  const clarificationCard = document.getElementById('clarification-card');
  const clarificationMsg = document.getElementById('clarification-message');
  const clarificationBackBtn = document.getElementById('clarification-back-btn');
  const resultsSection = document.getElementById('results-section');
  const bannerRange = document.getElementById('banner-range');
  const scopeTbody = document.getElementById('scope-tbody');
  const totalRangeCell = document.getElementById('total-range-cell');
  const notesCard = document.getElementById('notes-card');
  const notesText = document.getElementById('notes-text');
  const outOfScopeCard = document.getElementById('out-of-scope-card');
  const outOfScopeList = document.getElementById('out-of-scope-list');
  const newEstimateBtn = document.getElementById('new-estimate-btn');
  const printBtn = document.getElementById('print-btn');
  const copyBtn = document.getElementById('copy-btn');
  const errorCard = document.getElementById('error-card');
  const errorMessage = document.getElementById('error-message');
  const errorRetryBtn = document.getElementById('error-retry-btn');

  // --- State ---
  const STATES = {
    INPUT: 'input',
    LOADING: 'loading',
    RESULTS: 'results',
    CLARIFICATION: 'clarification',
    ERROR: 'error'
  };

  let currentState = STATES.INPUT;
  let lastEstimate = null;

  // --- Utilities ---
  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function fmtRange(low, high) {
    return fmt(low) + ' \u2013 ' + fmt(high);
  }

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  // --- State machine ---
  function setState(newState, data) {
    currentState = newState;

    // Hide everything first
    hide(inputCard);
    hide(loadingCard);
    hide(clarificationCard);
    hide(resultsSection);
    hide(errorCard);

    switch (newState) {
      case STATES.INPUT:
        show(inputCard);
        textarea.focus();
        break;

      case STATES.LOADING:
        show(loadingCard);
        break;

      case STATES.CLARIFICATION:
        show(inputCard);
        show(clarificationCard);
        clarificationMsg.textContent = data.message || 'Please provide more detail about your project.';
        break;

      case STATES.RESULTS:
        show(resultsSection);
        lastEstimate = data;
        renderResults(data);
        break;

      case STATES.ERROR:
        show(inputCard);
        show(errorCard);
        errorMessage.textContent = data.message || 'Something went wrong. Please try again.';
        break;
    }
  }

  // --- Render results ---
  function renderResults(estimate) {
    // Banner
    bannerRange.textContent = fmtRange(estimate.total_low, estimate.total_high);

    // Line items
    scopeTbody.innerHTML = '';
    (estimate.line_items || []).forEach(function (item) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
          '<div class="item-label">' + escHtml(item.label) + '</div>' +
          '<div class="item-desc">' + escHtml(item.description) + '</div>' +
        '</td>' +
        '<td class="item-range">' + fmtRange(item.range_low, item.range_high) + '</td>';
      scopeTbody.appendChild(tr);
    });

    // Total
    totalRangeCell.textContent = fmtRange(estimate.total_low, estimate.total_high);

    // Notes
    if (estimate.notes) {
      notesText.textContent = estimate.notes;
      show(notesCard);
    } else {
      hide(notesCard);
    }

    // Out of scope
    const oos = estimate.out_of_scope || [];
    if (oos.length > 0) {
      outOfScopeList.innerHTML = '';
      oos.forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = item;
        outOfScopeList.appendChild(li);
      });
      show(outOfScopeCard);
    } else {
      hide(outOfScopeCard);
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- XSS prevention ---
  function escHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Character counter ---
  textarea.addEventListener('input', function () {
    const len = textarea.value.length;
    charCount.textContent = len;
    const counter = charCount.closest('.char-counter') || charCount.parentElement;
    counter.classList.remove('warn', 'error');
    if (len > 900) counter.classList.add('error');
    else if (len > 750) counter.classList.add('warn');
  });

  // --- Submit ---
  async function submitEstimate() {
    const input = textarea.value.trim();
    if (!input) {
      textarea.focus();
      return;
    }

    // Set loading state
    setState(STATES.LOADING);
    estimateBtn.disabled = true;
    estimateBtn.classList.add('is-loading');

    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      var data;
      try {
        data = await response.json();
      } catch {
        setState(STATES.ERROR, { message: 'The server returned an unexpected response. Please try again.' });
        return;
      }

      if (!response.ok) {
        if (response.status === 429) {
          setState(STATES.ERROR, { message: 'You\'ve made too many requests. Please wait a minute and try again.' });
        } else if (data.error === 'input_too_long') {
          setState(STATES.ERROR, { message: 'Your description is too long. Please keep it under 1,000 characters.' });
        } else {
          setState(STATES.ERROR, { message: data.message || 'Something went wrong. Please try again.' });
        }
        return;
      }

      if (data.status === 'clarification_needed') {
        setState(STATES.CLARIFICATION, { message: data.clarification_message });
      } else {
        setState(STATES.RESULTS, data);
      }

    } catch (err) {
      setState(STATES.ERROR, { message: 'A network error occurred. Please check your connection and try again.' });
    } finally {
      estimateBtn.disabled = false;
      estimateBtn.classList.remove('is-loading');
    }
  }

  // --- Event listeners ---
  estimateBtn.addEventListener('click', submitEstimate);

  textarea.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      submitEstimate();
    }
  });

  clarificationBackBtn.addEventListener('click', function () {
    setState(STATES.INPUT);
  });

  newEstimateBtn.addEventListener('click', function () {
    textarea.value = '';
    charCount.textContent = '0';
    setState(STATES.INPUT);
  });

  errorRetryBtn.addEventListener('click', function () {
    setState(STATES.INPUT);
  });

  // --- Print ---
  printBtn.addEventListener('click', function () {
    window.print();
  });

  // --- Copy estimate to clipboard ---
  function buildEstimateText(est) {
    var lines = ['Fishbeck Innovations — Project Estimate', ''];
    (est.line_items || []).forEach(function (item) {
      lines.push(item.label + ': ' + fmtRange(item.range_low, item.range_high));
      lines.push('  ' + item.description);
    });
    lines.push('');
    lines.push('Total: ' + fmtRange(est.total_low, est.total_high));
    if (est.notes) {
      lines.push('');
      lines.push('Notes: ' + est.notes);
    }
    var oos = est.out_of_scope || [];
    if (oos.length > 0) {
      lines.push('');
      lines.push('Outside our core services:');
      oos.forEach(function (item) { lines.push('  - ' + item); });
    }
    lines.push('');
    lines.push('This is an AI-generated estimate. Contact jimmy@fishbeckinnovations.com for a formal proposal.');
    return lines.join('\n');
  }

  copyBtn.addEventListener('click', function () {
    if (!lastEstimate) return;
    var text = buildEstimateText(lastEstimate);
    navigator.clipboard.writeText(text).then(function () {
      var originalHtml = copyBtn.innerHTML;
      copyBtn.textContent = 'Copied!';
      setTimeout(function () { copyBtn.innerHTML = originalHtml; }, 1500);
    });
  });

})();
