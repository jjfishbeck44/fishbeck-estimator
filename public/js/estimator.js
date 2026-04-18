// public/js/estimator.js
// Client-side logic for the Fishbeck Project Estimator
// Handles: form interaction, API call, result rendering, state management

function createEstimator(doc, opts) {
  'use strict';
  opts = opts || {};
  const fetchImpl = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);

  // --- DOM refs ---
  const textarea = doc.getElementById('project-input');
  const charCount = doc.getElementById('char-count');
  const estimateBtn = doc.getElementById('estimate-btn');
  const inputCard = doc.getElementById('input-card');
  const loadingCard = doc.getElementById('loading-card');
  const clarificationCard = doc.getElementById('clarification-card');
  const clarificationMsg = doc.getElementById('clarification-message');
  const clarificationBackBtn = doc.getElementById('clarification-back-btn');
  const resultsSection = doc.getElementById('results-section');
  const bannerRange = doc.getElementById('banner-range');
  const scopeTbody = doc.getElementById('scope-tbody');
  const totalRangeCell = doc.getElementById('total-range-cell');
  const notesCard = doc.getElementById('notes-card');
  const notesText = doc.getElementById('notes-text');
  const outOfScopeCard = doc.getElementById('out-of-scope-card');
  const outOfScopeList = doc.getElementById('out-of-scope-list');
  const newEstimateBtn = doc.getElementById('new-estimate-btn');
  const errorCard = doc.getElementById('error-card');
  const errorMessage = doc.getElementById('error-message');
  const errorRetryBtn = doc.getElementById('error-retry-btn');

  // --- State ---
  const STATES = {
    INPUT: 'input',
    LOADING: 'loading',
    RESULTS: 'results',
    CLARIFICATION: 'clarification',
    ERROR: 'error'
  };

  let currentState = STATES.INPUT;

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
      const tr = doc.createElement('tr');
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
        const li = doc.createElement('li');
        li.textContent = item;
        outOfScopeList.appendChild(li);
      });
      show(outOfScopeCard);
    } else {
      hide(outOfScopeCard);
    }

    // Scroll to results
    if (typeof resultsSection.scrollIntoView === 'function') {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- XSS prevention ---
  function escHtml(str) {
    const div = doc.createElement('div');
    div.appendChild(doc.createTextNode(str));
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
      const response = await fetchImpl('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle typed API errors
        if (response.status === 429) {
          setState(STATES.ERROR, { message: 'You\'ve made too many requests. Please wait a minute and try again.' });
        } else if (data.error === 'input_too_long') {
          setState(STATES.ERROR, { message: 'Your description is too long. Please keep it under 1,000 characters.' });
        } else {
          setState(STATES.ERROR, { message: data.message || 'Something went wrong. Please try again.' });
        }
        return;
      }

      // Success
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

  return {
    STATES: STATES,
    fmt: fmt,
    fmtRange: fmtRange,
    escHtml: escHtml,
    setState: setState,
    renderResults: renderResults,
    submitEstimate: submitEstimate,
    getCurrentState: function () { return currentState; }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createEstimator: createEstimator };
} else {
  createEstimator(document);
}
