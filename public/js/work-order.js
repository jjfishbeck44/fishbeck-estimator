// public/js/work-order.js
// Work Order Prep frontend — factory pattern for testability.

function createWorkOrderApp(doc, opts) {
  'use strict';
  opts = opts || {};
  const fetchImpl = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);

  // DOM refs
  const textarea    = doc.getElementById('wo-input');
  const charCount   = doc.getElementById('char-count');
  const parseBtn    = doc.getElementById('parse-btn');
  const inputCard   = doc.getElementById('input-card');
  const loadingCard = doc.getElementById('loading-card');
  const resultsSection = doc.getElementById('results-section');
  const errorCard   = doc.getElementById('error-card');
  const errorMsg    = doc.getElementById('error-message');
  const errorRetry  = doc.getElementById('error-retry-btn');
  const newWoBtn    = doc.getElementById('new-wo-btn');

  const woMeta      = doc.getElementById('wo-meta');
  const flagsSection = doc.getElementById('flags-section');
  const flagsRow    = doc.getElementById('flags-row');
  const scopeTbody  = doc.getElementById('scope-tbody');
  const checklistList = doc.getElementById('checklist-list');
  const budgetGrid  = doc.getElementById('budget-grid');
  const hoursDisplay = doc.getElementById('hours-display');
  const oosCard     = doc.getElementById('oos-card');
  const oosList     = doc.getElementById('oos-list');
  const pmNotesCard = doc.getElementById('pm-notes-card');
  const pmNotesText = doc.getElementById('pm-notes-text');

  const MAX_CHARS = 5000;

  // --- Utilities ---

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function fmtRange(lo, hi) {
    return fmt(lo) + ' – ' + fmt(hi);
  }

  function show(el) { el.style.display = ''; }
  function hide(el) { el.style.display = 'none'; }

  // --- States ---

  const STATES = { INPUT: 'INPUT', LOADING: 'LOADING', RESULTS: 'RESULTS', ERROR: 'ERROR' };

  function setState(state, data) {
    hide(inputCard);
    hide(loadingCard);
    hide(resultsSection);
    hide(errorCard);

    if (state === STATES.INPUT) {
      show(inputCard);
    } else if (state === STATES.LOADING) {
      show(loadingCard);
    } else if (state === STATES.RESULTS) {
      renderResults(data);
      show(resultsSection);
    } else if (state === STATES.ERROR) {
      errorMsg.textContent = data && data.message ? data.message : 'Something went wrong. Please try again.';
      show(errorCard);
    }
  }

  // --- Render ---

  function renderMeta(wo) {
    const fields = [
      { label: 'Work Order #', value: wo.work_order_number || '—' },
      { label: 'Address',      value: wo.address || '—' },
      { label: 'Agency',       value: wo.agency || '—' },
      { label: 'Move-in Date', value: wo.move_in_date || '—' }
    ];
    woMeta.innerHTML = fields.map(f =>
      `<div class="wo-meta-item">
        <div class="wo-meta-label">${escHtml(f.label)}</div>
        <div class="wo-meta-value">${escHtml(f.value)}</div>
      </div>`
    ).join('');
  }

  function renderFlags(flags) {
    if (!flags || flags.length === 0) { hide(flagsSection); return; }
    const ALERT_FLAGS = new Set(['move_in_imminent', 'permit_required', 'tenant_occupied', 'hoa_restrictions', 'pm_contact_required']);
    flagsRow.innerHTML = flags.map(f => {
      const cls = ALERT_FLAGS.has(f) ? 'flag-chip alert' : 'flag-chip';
      const label = f.replace(/_/g, ' ');
      return `<span class="${cls}">${escHtml(label)}</span>`;
    }).join('');
    show(flagsSection);
  }

  function renderScope(scope) {
    if (!scope || scope.length === 0) { scopeTbody.innerHTML = '<tr><td colspan="5" style="color:#6B7280;padding:1rem;">No scope items extracted.</td></tr>'; return; }
    scopeTbody.innerHTML = scope.map(item => {
      const badge = item.clearance_sourceable
        ? '<span class="badge-clearance">✓ Clearance</span>'
        : '<span class="badge-retail">✗ Brand-locked</span>';
      const mats = (item.materials_needed || []).map(m => escHtml(m)).join(', ');
      return `<tr>
        <td><strong>${escHtml(item.task)}</strong>${item.spec_note ? `<br><span style="color:#6B7280;font-size:0.78rem;">${escHtml(item.spec_note)}</span>` : ''}</td>
        <td>${escHtml(item.area || '—')}</td>
        <td>${escHtml(item.quantity || '—')}</td>
        <td style="text-align:center;">${badge}</td>
        <td style="color:#4B5563;">${mats || '—'}</td>
      </tr>`;
    }).join('');
  }

  function renderChecklist(items) {
    if (!items || items.length === 0) { checklistList.innerHTML = ''; return; }
    checklistList.innerHTML = items.map(item =>
      `<li>${escHtml(item)}</li>`
    ).join('');
  }

  function renderBudget(budget) {
    if (!budget) { hide(doc.getElementById('budget-card')); return; }
    const savings_low = Math.max(0, (budget.retail_low || 0) - (budget.clearance_high || 0));
    const savings_high = Math.max(0, (budget.retail_high || 0) - (budget.clearance_low || 0));
    budgetGrid.innerHTML = `
      <div class="budget-card clearance">
        <div class="budget-label">Clearance Materials</div>
        <div class="budget-amount">${fmtRange(budget.clearance_low, budget.clearance_high)}</div>
      </div>
      <div class="budget-card">
        <div class="budget-label">Retail Materials</div>
        <div class="budget-amount">${fmtRange(budget.retail_low, budget.retail_high)}</div>
      </div>
      <div class="budget-card savings" style="grid-column:1/-1;">
        <div class="budget-label">Estimated Savings vs. Retail</div>
        <div class="budget-amount">${fmtRange(savings_low, savings_high)}</div>
      </div>`;
  }

  function renderResults(wo) {
    renderMeta(wo);
    renderFlags(wo.flags);
    renderScope(wo.scope);
    renderChecklist(wo.pre_arrival_checklist);
    renderBudget(wo.material_budget);

    // Hours
    hoursDisplay.innerHTML = wo.total_hours
      ? `<div class="hours-badge">⏱ ${escHtml(String(wo.total_hours))} hrs estimated</div>`
      : '<div style="color:#6B7280;font-size:0.875rem;">Not estimated</div>';

    // Out of scope
    if (wo.out_of_scope && wo.out_of_scope.length > 0) {
      oosList.innerHTML = wo.out_of_scope.map(s => `<li>${escHtml(s)}</li>`).join('');
      show(oosCard);
    } else {
      hide(oosCard);
    }

    // PM notes
    if (wo.pm_notes) {
      pmNotesText.textContent = wo.pm_notes;
      show(pmNotesCard);
    } else {
      hide(pmNotesCard);
    }
  }

  // --- Submit ---

  async function submitWorkOrder() {
    const input = textarea ? textarea.value.trim() : '';
    if (!input) {
      setState(STATES.ERROR, { message: 'Please paste a work order before parsing.' });
      return;
    }

    setState(STATES.LOADING);

    try {
      const response = await fetchImpl('/api/work-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      const data = await response.json();

      if (response.status === 429) {
        setState(STATES.ERROR, { message: 'Too many requests. Please wait a moment and try again.' });
      } else if (response.status === 400) {
        setState(STATES.ERROR, { message: data.message || 'Invalid input.' });
      } else if (!response.ok) {
        setState(STATES.ERROR, { message: data.message || 'Something went wrong. Please try again.' });
      } else {
        setState(STATES.RESULTS, data);
      }
    } catch {
      setState(STATES.ERROR, { message: 'Network error. Check your connection and try again.' });
    }
  }

  // --- Event wiring ---

  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len + ' / ' + MAX_CHARS;
      const pct = len / MAX_CHARS;
      charCount.className = 'char-counter' + (pct >= 1 ? ' over-limit' : pct >= 0.8 ? ' near-limit' : '');
    });

    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        submitWorkOrder();
      }
    });
  }

  if (parseBtn) {
    parseBtn.addEventListener('click', submitWorkOrder);
  }

  if (errorRetry) {
    errorRetry.addEventListener('click', () => setState(STATES.INPUT));
  }

  if (newWoBtn) {
    newWoBtn.addEventListener('click', () => {
      if (textarea) textarea.value = '';
      if (charCount) charCount.textContent = '0 / ' + MAX_CHARS;
      setState(STATES.INPUT);
    });
  }

  setState(STATES.INPUT);

  return { STATES, escHtml, fmt, fmtRange, setState, renderResults, submitWorkOrder, renderMeta, renderFlags, renderScope, renderChecklist, renderBudget };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createWorkOrderApp };
} else {
  createWorkOrderApp(document);
}
