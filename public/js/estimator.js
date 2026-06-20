// public/js/estimator.js
// Client-side logic for the Fishbeck Project Estimator
// Handles: form interaction, API call, result rendering, state management

(function () {
  'use strict';

  // --- DOM refs ---
  var projectNameInput = document.getElementById('project-name');
  var textarea = document.getElementById('project-input');
  var charCount = document.getElementById('char-count');
  var estimateBtn = document.getElementById('estimate-btn');
  var inputCard = document.getElementById('input-card');
  var loadingCard = document.getElementById('loading-card');
  var clarificationCard = document.getElementById('clarification-card');
  var clarificationMsg = document.getElementById('clarification-message');
  var clarificationBackBtn = document.getElementById('clarification-back-btn');
  var resultsSection = document.getElementById('results-section');
  var projectSummaryCard = document.getElementById('project-summary-card');
  var projectSummaryText = document.getElementById('project-summary-text');
  var bannerRange = document.getElementById('banner-range');
  var scopeTbody = document.getElementById('scope-tbody');
  var totalRangeCell = document.getElementById('total-range-cell');
  var estimateTimestamp = document.getElementById('estimate-timestamp');
  var chartCard = document.getElementById('chart-card');
  var chartBars = document.getElementById('chart-bars');
  var notesCard = document.getElementById('notes-card');
  var notesText = document.getElementById('notes-text');
  var outOfScopeCard = document.getElementById('out-of-scope-card');
  var outOfScopeList = document.getElementById('out-of-scope-list');
  var newEstimateBtn = document.getElementById('new-estimate-btn');
  var reEstimateBtn = document.getElementById('re-estimate-btn');
  var printBtn = document.getElementById('print-btn');
  var copyBtn = document.getElementById('copy-btn');
  var bannerProjectName = document.getElementById('banner-project-name');
  var shareBtn = document.getElementById('share-btn');
  var downloadCsvBtn = document.getElementById('download-csv-btn');
  var proposalLink = document.getElementById('proposal-link');
  var errorCard = document.getElementById('error-card');
  var errorMessage = document.getElementById('error-message');
  var errorRetryBtn = document.getElementById('error-retry-btn');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var historySearchWrap = document.getElementById('history-search-wrap');
  var historySearchInput = document.getElementById('history-search');
  var templatesEl = document.getElementById('templates');
  var loadingText = document.getElementById('loading-text');
  var progressFill = document.getElementById('progress-fill');
  var confirmModal = document.getElementById('confirm-modal');
  var confirmOkBtn = document.getElementById('confirm-ok');
  var confirmCancelBtn = document.getElementById('confirm-cancel');
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
  var lastProjectName = '';
  var lastRefId = '';
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

  function generateRefId() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var id = 'FI-';
    for (var i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

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

    if (lastProjectName) {
      bannerProjectName.textContent = lastProjectName;
      show(bannerProjectName);
    } else {
      hide(bannerProjectName);
    }

    if (lastInput) {
      projectSummaryText.textContent = lastInput;
      show(projectSummaryCard);
    } else {
      hide(projectSummaryCard);
    }

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

    renderChart(estimate.line_items);

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

    if (lastInput) {
      show(reEstimateBtn);
    } else {
      hide(reEstimateBtn);
    }

    var now = new Date();
    var tsText = 'Estimated ' + now.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    }) + ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (lastRefId) tsText += '  ·  Ref ' + lastRefId;
    estimateTimestamp.textContent = tsText;

    resultsSection.classList.remove('fade-up');
    void resultsSection.offsetWidth;
    resultsSection.classList.add('fade-up');

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    bannerRange.setAttribute('tabindex', '-1');
    bannerRange.focus({ preventScroll: true });
  }

  // --- Cost breakdown chart ---
  var CHART_COLORS = ['#1B3A5C', '#2563EB', '#C8963E', '#059669', '#7C3AED', '#DC2626', '#D97706', '#0891B2', '#4F46E5', '#BE185D'];

  function renderChart(items) {
    chartBars.innerHTML = '';
    var valid = (items || []).filter(function (item) { return item && num(item.range_high) > 0; });
    if (valid.length < 2) {
      hide(chartCard);
      return;
    }
    show(chartCard);
    var maxHigh = 0;
    valid.forEach(function (item) {
      var h = num(item.range_high);
      if (h > maxHigh) maxHigh = h;
    });
    if (maxHigh === 0) { hide(chartCard); return; }

    valid.forEach(function (item, i) {
      var low = num(item.range_low);
      var high = num(item.range_high);
      var pct = Math.round((high / maxHigh) * 100);
      var color = CHART_COLORS[i % CHART_COLORS.length];

      var row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML =
        '<div class="chart-label">' + escHtml(item.label) + '</div>' +
        '<div class="chart-track">' +
          '<div class="chart-fill" style="width:' + pct + '%;background:' + color + '"></div>' +
        '</div>' +
        '<div class="chart-value">' + fmtRange(low, high) + '</div>';
      chartBars.appendChild(row);
    });
  }

  // --- Format estimate as plain text ---
  function buildEstimateText(est) {
    var lines = ['Fishbeck Innovations — Project Estimate'];
    if (lastRefId) lines[0] += '  (' + lastRefId + ')';
    lines.push('');
    if (lastProjectName) {
      lines.push('Project: ' + lastProjectName);
    }
    if (lastInput) {
      lines.push('Description: ' + lastInput);
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

  // --- Export estimate as CSV ---
  function buildEstimateCsv(est) {
    var header = [];
    if (lastProjectName) header.push(['Project', '"' + lastProjectName.replace(/"/g, '""') + '"', '', '']);
    if (lastRefId) header.push(['Reference', lastRefId, '', '']);
    if (header.length) header.push(['', '', '', '']);

    var rows = header.concat([['Item', 'Description', 'Low', 'High']]);
    (est.line_items || []).forEach(function (item) {
      rows.push([
        '"' + (item.label || '').replace(/"/g, '""') + '"',
        '"' + (item.description || '').replace(/"/g, '""') + '"',
        num(item.range_low),
        num(item.range_high)
      ]);
    });
    rows.push(['Total', '', num(est.total_low), num(est.total_high)]);
    return rows.map(function (r) { return r.join(','); }).join('\n');
  }

  function downloadCsv(est) {
    var csv = buildEstimateCsv(est);
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    var filename = 'fishbeck-estimate';
    if (lastRefId) filename += '-' + lastRefId;
    if (lastProjectName) filename += '-' + lastProjectName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').substring(0, 40);
    a.download = filename + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Email proposal link ---
  function updateProposalLink(estimate) {
    var body = buildEstimateText(estimate);
    body += '\n\n---\nI would like to request a formal proposal for this project. Please contact me to discuss details.';
    var subject = 'Project Proposal Request';
    if (lastRefId) subject += ' — ' + lastRefId;
    if (lastProjectName) subject += ' — ' + lastProjectName;
    var href = 'mailto:jimmy@fishbeckinnovations.com'
      + '?subject=' + encodeURIComponent(subject)
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

  function saveToHistory(input, estimate, projectName, refId) {
    var history = getHistory();
    var entry = {
      input: input,
      estimate: estimate,
      timestamp: Date.now(),
      refId: refId
    };
    if (projectName) entry.name = projectName;
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {
      // localStorage full or unavailable
    }
  }

  function removeFromHistory(index) {
    var history = getHistory();
    history.splice(index, 1);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
    renderHistory();
  }

  function formatTimestamp(ts) {
    var date = new Date(ts);
    var now = new Date();
    var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (date.getFullYear() !== now.getFullYear()) {
      dateStr += ', ' + date.getFullYear();
    }
    var timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return dateStr + ' · ' + timeStr;
  }

  function renderHistory() {
    var history = getHistory();
    if (history.length === 0) {
      hide(historyCard);
      hide(historySearchWrap);
      return;
    }
    show(historyCard);
    if (history.length >= 4) {
      show(historySearchWrap);
    } else {
      hide(historySearchWrap);
    }

    var filter = (historySearchInput.value || '').toLowerCase().trim();
    var filtered = history.map(function (entry, idx) {
      return { entry: entry, idx: idx };
    });
    if (filter) {
      filtered = filtered.filter(function (item) {
        var text = (item.entry.name || '') + ' ' + item.entry.input + ' ' + (item.entry.refId || '');
        return text.toLowerCase().indexOf(filter) !== -1;
      });
    }

    historyList.innerHTML = '';
    filtered.forEach(function (item) {
      var entry = item.entry;
      var idx = item.idx;
      var item = document.createElement('div');
      item.className = 'history-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');

      var nameHtml = entry.name
        ? '<div class="history-name">' + escHtml(entry.name) + '</div>'
        : '';
      var refHtml = entry.refId
        ? '<span class="history-ref">' + escHtml(entry.refId) + '</span>'
        : '';

      item.innerHTML =
        '<div class="history-content">' +
          '<div class="history-text">' +
            nameHtml +
            '<div class="history-input">' + escHtml(entry.input) + '</div>' +
          '</div>' +
          '<div class="history-meta">' +
            '<span class="history-range">' + fmtRange(entry.estimate.total_low, entry.estimate.total_high) + '</span>' +
            '<span class="history-date">' + formatTimestamp(entry.timestamp) + (refHtml ? ' · ' : '') + refHtml + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="history-delete" title="Remove" aria-label="Remove estimate" type="button">&times;</button>';

      var deleteBtn = item.querySelector('.history-delete');
      deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeFromHistory(idx);
      });

      item.addEventListener('click', function (e) {
        if (e.target.closest('.history-delete')) return;
        lastInput = entry.input;
        lastProjectName = entry.name || '';
        lastRefId = entry.refId || '';
        textarea.value = entry.input;
        projectNameInput.value = lastProjectName;
        updateCharCount();
        autoResize();
        setState(STATES.RESULTS, entry.estimate);
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.target.closest('.history-delete')) {
          lastInput = entry.input;
          lastProjectName = entry.name || '';
          lastRefId = entry.refId || '';
          textarea.value = entry.input;
          projectNameInput.value = lastProjectName;
          updateCharCount();
          autoResize();
          setState(STATES.RESULTS, entry.estimate);
        }
      });

      historyList.appendChild(item);
    });
  }

  // --- Draft persistence ---
  var DRAFT_NAME_KEY = 'fishbeck_draft_name';

  function saveDraft() {
    try {
      sessionStorage.setItem(DRAFT_KEY, textarea.value);
      sessionStorage.setItem(DRAFT_NAME_KEY, projectNameInput.value);
    } catch {}
  }

  function restoreDraft() {
    try {
      var draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft && !textarea.value) {
        textarea.value = draft;
        updateCharCount();
        autoResize();
      }
      var draftName = sessionStorage.getItem(DRAFT_NAME_KEY);
      if (draftName && !projectNameInput.value) {
        projectNameInput.value = draftName;
      }
    } catch {}
  }

  function clearDraft() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(DRAFT_NAME_KEY);
    } catch {}
  }

  // --- Character counter & auto-resize ---
  textarea.addEventListener('input', function () {
    updateCharCount();
    autoResize();
    saveDraft();
  });

  projectNameInput.addEventListener('input', saveDraft);

  historySearchInput.addEventListener('input', renderHistory);

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
    lastProjectName = projectNameInput.value.trim();
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
        lastRefId = generateRefId();
        saveToHistory(input, data, lastProjectName, lastRefId);
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

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!confirmModal.classList.contains('hidden')) {
        hideConfirm();
      } else if (currentState === STATES.ERROR || currentState === STATES.CLARIFICATION) {
        setState(STATES.INPUT);
      }
    }
  });

  reEstimateBtn.addEventListener('click', function () {
    if (lastInput) {
      textarea.value = lastInput;
      updateCharCount();
      autoResize();
      submitEstimate();
    }
  });

  newEstimateBtn.addEventListener('click', function () {
    textarea.value = '';
    projectNameInput.value = '';
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

  // --- Download CSV ---
  downloadCsvBtn.addEventListener('click', function () {
    if (!lastEstimate) return;
    downloadCsv(lastEstimate);
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

  // --- Confirm modal ---
  var confirmCallback = null;

  function showConfirm(onConfirm) {
    confirmCallback = onConfirm;
    show(confirmModal);
    confirmOkBtn.focus();
  }

  function hideConfirm() {
    hide(confirmModal);
    confirmCallback = null;
    clearHistoryBtn.focus();
  }

  confirmOkBtn.addEventListener('click', function () {
    if (confirmCallback) confirmCallback();
    hideConfirm();
  });

  confirmCancelBtn.addEventListener('click', hideConfirm);

  confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) hideConfirm();
  });

  confirmModal.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      var focusable = [confirmCancelBtn, confirmOkBtn];
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Clear history ---
  clearHistoryBtn.addEventListener('click', function () {
    showConfirm(function () {
      try { localStorage.removeItem(HISTORY_KEY); } catch {}
      renderHistory();
    });
  });

  // --- Init ---
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  restoreDraft();
  renderHistory();

})();
