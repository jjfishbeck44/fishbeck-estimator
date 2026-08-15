// public/js/estimator.js
// Client-side logic for the Fishbeck Project Estimator
// Handles: form interaction, API call, result rendering, state management

function createEstimator(doc, opts) {
  'use strict';
  opts = opts || {};
  var fetchImpl = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);

  // --- DOM refs ---
  var projectNameInput = doc.getElementById('project-name');
  var textarea = doc.getElementById('project-input');
  var charCount = doc.getElementById('char-count');
  var estimateBtn = doc.getElementById('estimate-btn');
  var inputCard = doc.getElementById('input-card');
  var loadingCard = doc.getElementById('loading-card');
  var clarificationCard = doc.getElementById('clarification-card');
  var clarificationMsg = doc.getElementById('clarification-message');
  var clarificationBackBtn = doc.getElementById('clarification-back-btn');
  var resultsSection = doc.getElementById('results-section');
  var projectSummaryCard = doc.getElementById('project-summary-card');
  var projectSummaryText = doc.getElementById('project-summary-text');
  var bannerRange = doc.getElementById('banner-range');
  var scopeTbody = doc.getElementById('scope-tbody');
  var totalRangeCell = doc.getElementById('total-range-cell');
  var estimateTimestamp = doc.getElementById('estimate-timestamp');
  var chartCard = doc.getElementById('chart-card');
  var chartBars = doc.getElementById('chart-bars');
  var notesCard = doc.getElementById('notes-card');
  var notesText = doc.getElementById('notes-text');
  var outOfScopeCard = doc.getElementById('out-of-scope-card');
  var outOfScopeList = doc.getElementById('out-of-scope-list');
  var newEstimateBtn = doc.getElementById('new-estimate-btn');
  var reEstimateBtn = doc.getElementById('re-estimate-btn');
  var printBtn = doc.getElementById('print-btn');
  var copyBtn = doc.getElementById('copy-btn');
  var bannerProjectName = doc.getElementById('banner-project-name');
  var estimateStats = doc.getElementById('estimate-stats');
  var statItems = doc.getElementById('stat-items');
  var statMidpoint = doc.getElementById('stat-midpoint');
  var statSpread = doc.getElementById('stat-spread');
  var shareBtn = doc.getElementById('share-btn');
  var downloadCsvBtn = doc.getElementById('download-csv-btn');
  var proposalLink = doc.getElementById('proposal-link');
  var errorCard = doc.getElementById('error-card');
  var errorMessage = doc.getElementById('error-message');
  var errorRetryBtn = doc.getElementById('error-retry-btn');
  var historyCard = doc.getElementById('history-card');
  var historyList = doc.getElementById('history-list');
  var clearHistoryBtn = doc.getElementById('clear-history-btn');
  var exportHistoryBtn = doc.getElementById('export-history-btn');
  var historySearchWrap = doc.getElementById('history-search-wrap');
  var historySearchInput = doc.getElementById('history-search');
  var templatesEl = doc.getElementById('templates');
  var loadingText = doc.getElementById('loading-text');
  var progressFill = doc.getElementById('progress-fill');
  var toast = doc.getElementById('toast');
  var confirmModal = doc.getElementById('confirm-modal');
  var confirmOkBtn = doc.getElementById('confirm-ok');
  var confirmCancelBtn = doc.getElementById('confirm-cancel');
  var footerYear = doc.getElementById('footer-year');

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
    var div = doc.createElement('div');
    div.appendChild(doc.createTextNode(str));
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

  async function fetchWithRetry(url, fetchOpts) {
    try {
      return await fetchImpl(url, fetchOpts);
    } catch (firstErr) {
      await new Promise(function (r) { setTimeout(r, 1500); });
      return fetchImpl(url, fetchOpts);
    }
  }

  var toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    show(toast);
    toast.classList.remove('toast-exit');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.add('toast-exit');
      setTimeout(function () { hide(toast); }, 300);
    }, 2000);
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

    var fragment = doc.createDocumentFragment();
    (estimate.line_items || []).forEach(function (item) {
      if (!item || !item.label) return;
      var tr = doc.createElement('tr');
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

    var itemCount = (estimate.line_items || []).length;
    var totalLow = num(estimate.total_low);
    var totalHigh = num(estimate.total_high);
    if (itemCount >= 2 && totalHigh > 0) {
      var midpoint = Math.round((totalLow + totalHigh) / 2);
      var spread = totalLow > 0 ? Math.round(((totalHigh - totalLow) / totalLow) * 100) : 0;
      statItems.querySelector('.stat-pill-value').textContent = itemCount;
      statMidpoint.querySelector('.stat-pill-value').textContent = fmt(midpoint);
      statSpread.querySelector('.stat-pill-value').textContent = '±' + Math.round(spread / 2) + '%';
      show(estimateStats);
    } else {
      hide(estimateStats);
    }

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
        var li = doc.createElement('li');
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

    if (resultsSection.scrollIntoView) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

      var row = doc.createElement('div');
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
    var a = doc.createElement('a');
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
      var item = doc.createElement('div');
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

      if (!response) {
        setState(STATES.ERROR, { message: 'A network error occurred. Please check your connection and try again.' });
        return;
      }

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

  doc.addEventListener('keydown', function (e) {
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
      showToast('Estimate copied to clipboard');
    });
  });

  // --- Download CSV ---
  downloadCsvBtn.addEventListener('click', function () {
    if (!lastEstimate) return;
    downloadCsv(lastEstimate);
    showToast('CSV downloaded');
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
        showToast('Estimate copied to clipboard');
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
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Export history as CSV ---
  exportHistoryBtn.addEventListener('click', function () {
    var history = getHistory();
    if (history.length === 0) return;
    var rows = [['Ref', 'Project', 'Description', 'Date', 'Low', 'High', 'Items']];
    history.forEach(function (entry) {
      var date = new Date(entry.timestamp).toLocaleDateString('en-US');
      var itemCount = (entry.estimate.line_items || []).length;
      rows.push([
        entry.refId || '',
        '"' + (entry.name || '').replace(/"/g, '""') + '"',
        '"' + (entry.input || '').replace(/"/g, '""') + '"',
        date,
        num(entry.estimate.total_low),
        num(entry.estimate.total_high),
        itemCount
      ]);
    });
    var csv = rows.map(function (r) { return r.join(','); }).join('\n');
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = doc.createElement('a');
    a.href = url;
    a.download = 'fishbeck-estimates-history.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported');
  });

  // --- Clear history ---
  clearHistoryBtn.addEventListener('click', function () {
    showConfirm(function () {
      try { localStorage.removeItem(HISTORY_KEY); } catch {}
      renderHistory();
    });
  });

  // --- Prefill from calculator tools (e.g. /?prefill=...) ---
  function applyPrefill() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch {
      return;
    }
    var prefill = params.get('prefill');
    if (!prefill) return;
    textarea.value = prefill.slice(0, 1000);
    updateCharCount();
    textarea.focus();
    if (textarea.scrollIntoView) textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // --- Init ---
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  restoreDraft();
  renderHistory();
  applyPrefill();

  return { STATES: STATES, escHtml: escHtml, fmt: fmt, fmtRange: fmtRange, setState: setState, renderResults: renderResults, submitEstimate: submitEstimate, getCurrentState: function () { return currentState; } };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createEstimator: createEstimator };
} else {
  createEstimator(document);
}
