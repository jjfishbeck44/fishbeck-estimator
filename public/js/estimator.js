// public/js/estimator.js
// Client-side logic for the Fishbeck Project Estimator
// Handles: form interaction, API call, result rendering, state management

(function () {
  'use strict';

  // --- DOM refs ---
  var textarea = document.getElementById('project-input');
  var charCount = document.getElementById('char-count');
  var estimateBtn = document.getElementById('estimate-btn');
  var inputCard = document.getElementById('input-card');
  var loadingCard = document.getElementById('loading-card');
  var clarificationCard = document.getElementById('clarification-card');
  var clarificationMsg = document.getElementById('clarification-message');
  var clarificationBackBtn = document.getElementById('clarification-back-btn');
  var resultsSection = document.getElementById('results-section');
  var bannerRange = document.getElementById('banner-range');
  var scopeTbody = document.getElementById('scope-tbody');
  var totalRangeCell = document.getElementById('total-range-cell');
  var notesCard = document.getElementById('notes-card');
  var notesText = document.getElementById('notes-text');
  var outOfScopeCard = document.getElementById('out-of-scope-card');
  var outOfScopeList = document.getElementById('out-of-scope-list');
  var newEstimateBtn = document.getElementById('new-estimate-btn');
  var printBtn = document.getElementById('print-btn');
  var copyBtn = document.getElementById('copy-btn');
  var shareBtn = document.getElementById('share-btn');
  var proposalLink = document.getElementById('proposal-link');
  var errorCard = document.getElementById('error-card');
  var errorMessage = document.getElementById('error-message');
  var errorRetryBtn = document.getElementById('error-retry-btn');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var templatesEl = document.getElementById('templates');
  var loadingText = document.getElementById('loading-text');
  var progressFill = document.getElementById('progress-fill');
  var footerYear = document.getElementById('footer-year');

  // --- Constants ---
  var STATES = {
    INPUT: 'input',
    LOADING: 'loading',
    RESULTS: 'results',
    CLARIFICATION: 'clarification',
    ERROR: 'error'
  };

  var HISTORY_KEY = 'fishbeck_estimates';
  var MAX_HISTORY = 10;
  var DRAFT_KEY = 'fishbeck_draft';
  var LOADING_MESSAGES = [
    'Analyzing your project…',
    'Reviewing scope of work…',
    'Looking up pricing…',
    'Building cost breakdown…',
    'Almost there…'
  ];

  var currentState = STATES.INPUT;
  var lastEstimate = null;
  var lastInput = '';
  var loadingInterval = null;

  // --- Utilities ---
  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function fmtRange(low, high) {
    return fmt(num(low)) + ' – ' + fmt(num(high));
  }

  function num(v) {
    var n = Number(v);
    return isFinite(n) ? n : 0;
  }

  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }

  function escHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function updateCharCount() {
    var len = textarea.value.length;
    charCount.textContent = len;
    var counter = charCount.closest('.char-counter') || charCount.parentElement;
    counter.classList.remove('warn', 'error');
    if (len > 900) counter.classList.add('error');
    else if (len > 750) counter.classList.add('warn');
  }

  async function fetchWithRetry(url, opts) {
    try {
      return await fetch(url, opts);
    } catch (firstErr) {
      await new Promise(function (r) { setTimeout(r, 1500); });
      return fetch(url, opts);
    }
  }

  function autoResize() {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(130, textarea.scrollHeight) + 'px';
  }

  // --- State machine ---
  function startLoadingMessages() {
    var idx = 0;
    loadingText.textContent = LOADING_MESSAGES[0];
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth;
    progressFill.style.transition = 'width 12s cubic-bezier(0.1, 0.5, 0.1, 1)';
    progressFill.style.width = '90%';
    if (loadingInterval) clearInterval(loadingInterval);
    loadingInterval = setInterval(function () {
      idx = Math.min(idx + 1, LOADING_MESSAGES.length - 1);
      loadingText.textContent = LOADING_MESSAGES[idx];
    }, 2500);
  }

  function setState(newState, data) {
    currentState = newState;

    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }

    hide(inputCard);
    hide(loadingCard);
    hide(clarificationCard);
    hide(resultsSection);
    hide(errorCard);

    switch (newState) {
      case STATES.INPUT:
        show(inputCard);
        renderHistory();
        textarea.focus();
        break;

      case STATES.LOADING:
        show(loadingCard);
        startLoadingMessages();
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
    bannerRange.textContent = fmtRange(estimate.total_low, estimate.total_high);

    var fragment = document.createDocumentFragment();
    (estimate.line_items || []).forEach(function (item) {
      if (!item || !item.label) return;
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
          '<div class="item-label">' + escHtml(item.label) + '</div>' +
          '<div class="item-desc">' + escHtml(item.description || '') + '</div>' +
        '</td>' +
        '<td class="item-range">' + fmtRange(item.range_low, item.range_high) + '</td>';
      fragment.appendChild(tr);
    });
    scopeTbody.innerHTML = '';
    scopeTbody.appendChild(fragment);

    totalRangeCell.textContent = fmtRange(estimate.total_low, estimate.total_high);

    if (estimate.notes) {
      notesText.textContent = estimate.notes;
      show(notesCard);
    } else {
      hide(notesCard);
    }

    var oos = estimate.out_of_scope || [];
    if (oos.length > 0) {
      outOfScopeList.innerHTML = '';
      oos.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        outOfScopeList.appendChild(li);
      });
      show(outOfScopeCard);
    } else {
      hide(outOfScopeCard);
    }

    updateProposalLink(estimate);

    resultsSection.classList.remove('fade-up');
    void resultsSection.offsetWidth;
    resultsSection.classList.add('fade-up');

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bannerRange.setAttribute('tabindex', '-1');
    bannerRange.focus({ preventScroll: true });
  }

  // --- Format estimate as plain text ---
  function buildEstimateText(est) {
    var lines = ['Fishbeck Innovations — Project Estimate', ''];
    if (lastInput) {
      lines.push('Project description: ' + lastInput);
      lines.push('');
    }
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
      lines.push('Outside core services:');
      oos.forEach(function (item) { lines.push('  - ' + item); });
    }
    lines.push('');
    lines.push('This is an AI-generated estimate. Contact jimmy@fishbeckinnovations.com for a formal proposal.');
    return lines.join('\n');
  }

  // --- Email proposal link ---
  function updateProposalLink(estimate) {
    var body = buildEstimateText(estimate);
    body += '\n\n---\nI would like to request a formal proposal for this project. Please contact me to discuss details.';
    var href = 'mailto:jimmy@fishbeckinnovations.com'
      + '?subject=' + encodeURIComponent('Project Proposal Request')
      + '&body=' + encodeURIComponent(body);
    proposalLink.href = href;
  }

  // --- Estimate history (localStorage) ---
  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveToHistory(input, estimate) {
    var history = getHistory();
    history.unshift({
      input: input,
      estimate: estimate,
      timestamp: Date.now()
    });
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // localStorage full or unavailable
    }
  }

  function renderHistory() {
    var history = getHistory();
    if (history.length === 0) {
      hide(historyCard);
      return;
    }
    show(historyCard);
    historyList.innerHTML = '';
    history.forEach(function (entry) {
      var item = document.createElement('div');
      item.className = 'history-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      var date = new Date(entry.timestamp);
      var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      item.innerHTML =
        '<div class="history-input">' + escHtml(entry.input) + '</div>' +
        '<div class="history-meta">' +
          '<span class="history-range">' + fmtRange(entry.estimate.total_low, entry.estimate.total_high) + '</span>' +
          '<span class="history-date">' + dateStr + '</span>' +
        '</div>';

      item.addEventListener('click', function () {
        lastInput = entry.input;
        textarea.value = entry.input;
        updateCharCount();
        setState(STATES.RESULTS, entry.estimate);
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          lastInput = entry.input;
          textarea.value = entry.input;
          updateCharCount();
          setState(STATES.RESULTS, entry.estimate);
        }
      });

      historyList.appendChild(item);
    });
  }

  // --- Draft persistence ---
  function saveDraft() {
    try { sessionStorage.setItem(DRAFT_KEY, textarea.value); } catch {}
  }

  function restoreDraft() {
    try {
      var draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft && !textarea.value) {
        textarea.value = draft;
        updateCharCount();
        autoResize();
      }
    } catch {}
  }

  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
  }

  // --- Character counter & auto-resize ---
  textarea.addEventListener('input', function () {
    updateCharCount();
    autoResize();
    saveDraft();
  });

  // --- Example templates ---
  templatesEl.addEventListener('click', function (e) {
    var chip = e.target.closest('.template-chip');
    if (!chip) return;
    textarea.value = chip.getAttribute('data-template');
    updateCharCount();
    autoResize();
    saveDraft();
    textarea.focus();
  });

  // --- Submit ---
  async function submitEstimate() {
    var input = textarea.value.trim();
    if (!input) {
      textarea.classList.add('shake');
      textarea.addEventListener('animationend', function () {
        textarea.classList.remove('shake');
      }, { once: true });
      textarea.focus();
      return;
    }

    lastInput = input;
    setState(STATES.LOADING);
    estimateBtn.disabled = true;
    estimateBtn.classList.add('is-loading');

    try {
      var response = await fetchWithRetry('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input })
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
        clearDraft();
        saveToHistory(input, data);
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
    textarea.style.height = '';
    charCount.textContent = '0';
    clearDraft();
    setState(STATES.INPUT);
  });

  errorRetryBtn.addEventListener('click', function () {
    if (lastInput && textarea.value.trim() === lastInput) {
      submitEstimate();
      return;
    }
    setState(STATES.INPUT);
  });

  // --- Print ---
  printBtn.addEventListener('click', function () {
    window.print();
  });

  // --- Copy estimate to clipboard ---
  copyBtn.addEventListener('click', function () {
    if (!lastEstimate) return;
    var text = buildEstimateText(lastEstimate);
    navigator.clipboard.writeText(text).then(function () {
      var originalHtml = copyBtn.innerHTML;
      copyBtn.textContent = 'Copied!';
      copyBtn.setAttribute('aria-label', 'Copied to clipboard');
      setTimeout(function () {
        copyBtn.innerHTML = originalHtml;
        copyBtn.setAttribute('aria-label', '');
      }, 1500);
    });
  });

  // --- Share estimate ---
  shareBtn.addEventListener('click', function () {
    if (!lastEstimate) return;
    var text = buildEstimateText(lastEstimate);
    if (navigator.share) {
      navigator.share({
        title: 'Fishbeck Innovations — Project Estimate',
        text: text
      }).catch(function () {});
    } else {
      navigator.clipboard.writeText(text).then(function () {
        var originalHtml = shareBtn.innerHTML;
        shareBtn.textContent = 'Copied!';
        setTimeout(function () { shareBtn.innerHTML = originalHtml; }, 1500);
      });
    }
  });

  // --- Clear history ---
  clearHistoryBtn.addEventListener('click', function () {
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    renderHistory();
  });

  // --- Init ---
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  restoreDraft();
  renderHistory();

})();
