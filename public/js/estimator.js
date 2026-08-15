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
  var estimateStats = document.getElementById('estimate-stats');
  var statItems = document.getElementById('stat-items');
  var statMidpoint = document.getElementById('stat-midpoint');
  var statSpread = document.getElementById('stat-spread');
  var shareBtn = document.getElementById('share-btn');
  var downloadCsvBtn = document.getElementById('download-csv-btn');
  var downloadPdfBtn = document.getElementById('download-pdf-btn');
  var proposalLink = document.getElementById('proposal-link');
  var errorCard = document.getElementById('error-card');
  var errorMessage = document.getElementById('error-message');
  var errorRetryBtn = document.getElementById('error-retry-btn');
  var historyCard = document.getElementById('history-card');
  var historyList = document.getElementById('history-list');
  var clearHistoryBtn = document.getElementById('clear-history-btn');
  var exportHistoryBtn = document.getElementById('export-history-btn');
  var historySearchWrap = document.getElementById('history-search-wrap');
  var historySearchInput = document.getElementById('history-search');
  var templatesEl = document.getElementById('templates');
  var loadingText = document.getElementById('loading-text');
  var progressFill = document.getElementById('progress-fill');
  var toast = document.getElementById('toast');
  var confirmModal = document.getElementById('confirm-modal');
  var confirmOkBtn = document.getElementById('confirm-ok');
  var confirmCancelBtn = document.getElementById('confirm-cancel');
  var footerYear = document.getElementById('footer-year');
  var comparisonCard = document.getElementById('comparison-card');
  var comparisonBody = document.getElementById('comparison-body');
  var comparisonCount = document.getElementById('comparison-count');
  var closeComparisonBtn = document.getElementById('close-comparison-btn');

  // --- Constants ---
  var STATES = {
    INPUT: 'input',
    LOADING: 'loading',
    RESULTS: 'results',
    CLARIFICATION: 'clarification',
    ERROR: 'error',
    COMPARISON: 'comparison'
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
  var selectedForComparison = []; // Array of {index, entry} objects

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

  // --- Export estimate as PDF ---
  function downloadPdf(est) {
    // Check if libraries are loaded
    if (!window.html2canvas || !window.jsPDF) {
      showToast('PDF libraries loading. Please try again in a moment.');
      return;
    }

    var jsPDF = window.jsPDF.jsPDF;
    var html2canvas = window.html2canvas;

    // Create a hidden container with the estimate content
    var container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '8.5in';
    container.style.padding = '0.5in';
    container.style.backgroundColor = '#ffffff';
    container.style.fontFamily = 'Inter, sans-serif';
    container.style.fontSize = '11px';
    container.style.lineHeight = '1.6';
    container.style.color = '#1B3A5C';

    // Build the HTML content for the PDF
    var html = '';
    html += '<div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #C8963E; padding-bottom: 15px;">';
    html += '<div style="font-size: 20px; font-weight: 700; color: #1B3A5C;">Fishbeck Innovations</div>';
    html += '<div style="font-size: 12px; color: #666;">Construction & Property Maintenance</div>';
    if (lastRefId) {
      html += '<div style="font-size: 11px; color: #999; margin-top: 5px;">Reference: ' + escHtml(lastRefId) + '</div>';
    }
    html += '</div>';

    // Project details
    if (lastProjectName || lastInput) {
      html += '<div style="margin-bottom: 15px;">';
      if (lastProjectName) {
        html += '<div style="margin-bottom: 8px;"><strong style="color: #1B3A5C;">Project:</strong> ' + escHtml(lastProjectName) + '</div>';
      }
      if (lastInput) {
        html += '<div style="margin-bottom: 8px;"><strong style="color: #1B3A5C;">Description:</strong> ' + escHtml(lastInput) + '</div>';
      }
      html += '</div>';
    }

    // Line items table
    html += '<table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">';
    html += '<thead>';
    html += '<tr style="border-bottom: 1px solid #ddd; background-color: #f9fafb;">';
    html += '<th style="text-align: left; padding: 8px; font-weight: 600; color: #1B3A5C;">Item</th>';
    html += '<th style="text-align: left; padding: 8px; font-weight: 600; color: #1B3A5C;">Description</th>';
    html += '<th style="text-align: right; padding: 8px; font-weight: 600; color: #1B3A5C; width: 80px;">Low</th>';
    html += '<th style="text-align: right; padding: 8px; font-weight: 600; color: #1B3A5C; width: 80px;">High</th>';
    html += '</tr>';
    html += '</thead>';
    html += '<tbody>';
    (est.line_items || []).forEach(function (item, idx) {
      var bgColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      html += '<tr style="border-bottom: 1px solid #e5e7eb; background-color: ' + bgColor + ';">';
      html += '<td style="padding: 8px; vertical-align: top;">' + escHtml(item.label || '') + '</td>';
      html += '<td style="padding: 8px; vertical-align: top; font-size: 10px; color: #666;">' + escHtml(item.description || '') + '</td>';
      html += '<td style="text-align: right; padding: 8px; vertical-align: top;">' + fmt(num(item.range_low)) + '</td>';
      html += '<td style="text-align: right; padding: 8px; vertical-align: top;">' + fmt(num(item.range_high)) + '</td>';
      html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';

    // Total
    html += '<div style="text-align: right; margin-bottom: 15px; padding-top: 10px; border-top: 2px solid #ddd;">';
    html += '<div style="font-size: 13px; font-weight: 700; color: #1B3A5C;">';
    html += 'Total: ' + fmtRange(num(est.total_low), num(est.total_high));
    html += '</div>';
    html += '</div>';

    // Notes
    if (est.notes) {
      html += '<div style="margin-bottom: 15px; padding: 10px; background-color: #f3f4f6; border-left: 3px solid #C8963E;">';
      html += '<strong style="color: #1B3A5C;">Notes:</strong><br/>';
      html += escHtml(est.notes);
      html += '</div>';
    }

    // Out of scope
    var oos = est.out_of_scope || [];
    if (oos.length > 0) {
      html += '<div style="margin-bottom: 15px;">';
      html += '<strong style="color: #1B3A5C;">Outside Core Services:</strong><br/>';
      html += '<ul style="margin-top: 5px; padding-left: 20px;">';
      oos.forEach(function (item) {
        html += '<li style="margin-bottom: 3px;">' + escHtml(item) + '</li>';
      });
      html += '</ul>';
      html += '</div>';
    }

    // Footer
    html += '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 9px; color: #999; text-align: center;">';
    html += '<p style="margin: 0 0 5px 0;">This is an AI-generated estimate. For a formal proposal, contact:</p>';
    html += '<p style="margin: 0; font-weight: 600; color: #1B3A5C;">jimmy@fishbeckinnovations.com | (612) 555-0123</p>';
    html += '</div>';

    container.innerHTML = html;
    document.body.appendChild(container);

    // Generate PDF from HTML
    html2canvas(container, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(function (canvas) {
      var pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });

      var pageWidth = pdf.internal.pageSize.getWidth();
      var pageHeight = pdf.internal.pageSize.getHeight();
      var imgWidth = pageWidth - 1; // 0.5in margins on each side
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      var position = 0.5; // Top margin

      var imgData = canvas.toDataURL('image/png');

      // Add pages as needed
      while (heightLeft >= 0) {
        if (position + heightLeft > pageHeight - 0.5) {
          // Need a new page
          pdf.addPage();
          position = 0.5;
          heightLeft -= (pageHeight - 1);
        } else {
          heightLeft = -1;
        }
        pdf.addImage(imgData, 'PNG', 0.5, position, imgWidth, imgHeight);
        if (heightLeft > 0) {
          position = 0.5;
          heightLeft -= (pageHeight - 1);
        }
      }

      // Download the PDF
      var filename = 'fishbeck-estimate';
      if (lastRefId) filename += '-' + lastRefId;
      if (lastProjectName) filename += '-' + lastProjectName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-').substring(0, 40);
      pdf.save(filename + '.pdf');

      // Clean up
      document.body.removeChild(container);
      showToast('PDF downloaded successfully');
    }).catch(function (err) {
      console.error('[pdf]', err);
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      showToast('PDF download failed. Please try again.');
    });
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
        '<input type="checkbox" class="history-checkbox" title="Select for comparison" aria-label="Select for comparison" />' +
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

      var checkbox = item.querySelector('.history-checkbox');
      var deleteBtn = item.querySelector('.history-delete');

      checkbox.addEventListener('change', function (e) {
        e.stopPropagation();
        if (checkbox.checked) {
          selectedForComparison.push({ index: idx, entry: entry });
        } else {
          selectedForComparison = selectedForComparison.filter(function (s) { return s.index !== idx; });
        }
        updateComparisonUI();
      });

      deleteBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeFromHistory(idx);
      });

      item.addEventListener('click', function (e) {
        if (e.target.closest('.history-delete') || e.target.closest('.history-checkbox')) return;
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

  // --- Estimate comparison ---
  function updateComparisonUI() {
    if (selectedForComparison.length >= 2) {
      show(comparisonCard);
      comparisonCount.textContent = selectedForComparison.length + ' selected';
      buildComparisonTable();
    } else {
      hide(comparisonCard);
      selectedForComparison = [];
    }
  }

  function buildComparisonTable() {
    var sorted = selectedForComparison.sort(function (a, b) {
      return b.entry.timestamp - a.entry.timestamp;
    });

    var html = '<div class="comparison-wrapper">';

    // Header with project info for each estimate
    html += '<div class="comparison-header">';
    sorted.forEach(function (item, idx) {
      var entry = item.entry;
      var total = fmtRange(num(entry.estimate.total_low), num(entry.estimate.total_high));
      html += '<div class="comparison-column">';
      html += '<div class="comparison-title">' + escHtml(entry.name || 'Estimate ' + (idx + 1)) + '</div>';
      html += '<div class="comparison-ref">' + escHtml(entry.refId || '') + '</div>';
      html += '<div class="comparison-desc">' + escHtml(entry.input.substring(0, 80)) + (entry.input.length > 80 ? '…' : '') + '</div>';
      html += '<div class="comparison-total">' + total + '</div>';
      html += '<div class="comparison-date">' + formatTimestamp(entry.timestamp) + '</div>';
      html += '</div>';
    });
    html += '</div>';

    // Line items comparison table
    var allItems = {};
    sorted.forEach(function (item, idx) {
      (item.entry.estimate.line_items || []).forEach(function (lineItem) {
        var key = lineItem.label;
        if (!allItems[key]) {
          allItems[key] = { label: lineItem.label, cols: [] };
        }
        allItems[key].cols[idx] = lineItem;
      });
    });

    html += '<div class="comparison-table-wrap">';
    html += '<table class="comparison-table">';
    html += '<thead><tr>';
    html += '<th class="col-item">Item</th>';
    sorted.forEach(function (item, idx) {
      html += '<th class="col-range">Est ' + (idx + 1) + '</th>';
    });
    html += '</tr></thead>';
    html += '<tbody>';

    Object.keys(allItems).forEach(function (key) {
      var item = allItems[key];
      html += '<tr>';
      html += '<td class="col-item"><strong>' + escHtml(item.label) + '</strong></td>';
      sorted.forEach(function (sel, idx) {
        var lineItem = item.cols[idx];
        var cellContent = lineItem
          ? fmtRange(num(lineItem.range_low), num(lineItem.range_high))
          : '—';
        html += '<td class="col-range">' + cellContent + '</td>';
      });
      html += '</tr>';
      // Show description on next row if any estimate has it
      var hasDesc = item.cols.some(function (li) { return li && li.description; });
      if (hasDesc) {
        html += '<tr class="desc-row">';
        html += '<td colspan="1"></td>';
        sorted.forEach(function (sel, idx) {
          var lineItem = item.cols[idx];
          var desc = lineItem ? (lineItem.description || '') : '';
          html += '<td class="desc-cell">' + escHtml(desc) + '</td>';
        });
        html += '</tr>';
      }
    });

    html += '</tbody>';
    html += '<tfoot><tr>';
    html += '<td class="col-item"><strong>Total</strong></td>';
    sorted.forEach(function (item) {
      var est = item.entry.estimate;
      html += '<td class="col-range total-cell">' + fmtRange(num(est.total_low), num(est.total_high)) + '</td>';
    });
    html += '</tr></tfoot>';
    html += '</table>';
    html += '</div>';

    html += '</div>';
    comparisonBody.innerHTML = html;
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

  closeComparisonBtn.addEventListener('click', function () {
    selectedForComparison = [];
    hide(comparisonCard);
    comparisonBody.innerHTML = '';
    renderHistory();
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

  downloadPdfBtn.addEventListener('click', function () {
    if (!lastEstimate) return;
    downloadPdf(lastEstimate);
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
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
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
    var a = document.createElement('a');
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

  // --- Init ---
  if (footerYear) footerYear.textContent = new Date().getFullYear();
  restoreDraft();
  renderHistory();

})();
