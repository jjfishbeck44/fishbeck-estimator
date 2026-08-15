// public/js/bid-score.js
// Bid Scorer frontend — factory pattern for testability.

function createBidScorer(doc, opts) {
  'use strict';
  opts = opts || {};
  const fetchImpl = opts.fetch || (typeof fetch !== 'undefined' ? fetch : null);

  // DOM refs
  const textarea    = doc.getElementById('bid-input');
  const charCount   = doc.getElementById('char-count');
  const scoreBtn    = doc.getElementById('score-btn');
  const inputCard   = doc.getElementById('input-card');
  const loadingCard = doc.getElementById('loading-card');
  const resultsSection = doc.getElementById('results-section');
  const errorCard   = doc.getElementById('error-card');
  const errorMsg    = doc.getElementById('error-message');
  const errorRetry  = doc.getElementById('error-retry-btn');
  const newBidBtn   = doc.getElementById('new-bid-btn');

  const verdictBanner = doc.getElementById('verdict-banner');
  const verdictLabel  = doc.getElementById('verdict-label');
  const verdictLiner  = doc.getElementById('verdict-liner');
  const bidMeta       = doc.getElementById('bid-meta');
  const scoreGrid     = doc.getElementById('score-grid');
  const flagsCard     = doc.getElementById('flags-card');
  const flagsRow      = doc.getElementById('flags-row');
  const oosCard       = doc.getElementById('oos-card');
  const oosList       = doc.getElementById('oos-list');

  const MAX_CHARS = 8000;

  // --- Utilities ---

  function escHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function scoreClass(n) {
    if (n >= 7) return 'high';
    if (n >= 4) return 'medium';
    return 'low';
  }

  function show(el) { if (el) el.style.display = ''; }
  function hide(el) { if (el) el.style.display = 'none'; }

  // --- States ---

  const STATES = { INPUT: 'INPUT', LOADING: 'LOADING', RESULTS: 'RESULTS', ERROR: 'ERROR' };

  function setState(state, data) {
    hide(inputCard); hide(loadingCard); hide(resultsSection); hide(errorCard);
    if (state === STATES.INPUT) {
      show(inputCard);
    } else if (state === STATES.LOADING) {
      show(loadingCard);
    } else if (state === STATES.RESULTS) {
      renderResults(data);
      show(resultsSection);
    } else if (state === STATES.ERROR) {
      if (errorMsg) errorMsg.textContent = data && data.message ? data.message : 'Something went wrong. Please try again.';
      show(errorCard);
    }
  }

  // --- Render ---

  function renderResults(score) {
    // Verdict banner
    const rec = (score.recommendation || 'review').toLowerCase();
    if (verdictBanner) {
      verdictBanner.className = 'verdict-banner ' + rec;
    }
    if (verdictLabel) verdictLabel.textContent = rec.toUpperCase();
    if (verdictLiner) verdictLiner.textContent = escHtml(score.recommendation_one_liner || '');

    // Metadata
    if (bidMeta) {
      const fields = [
        { label: 'Title',    value: score.title   || '—' },
        { label: 'Agency',   value: score.agency  || '—' },
        { label: 'Due Date', value: score.due_date || '—' }
      ];
      bidMeta.innerHTML = fields.map(f =>
        `<div class="bid-meta-item">
          <div class="bid-meta-label">${escHtml(f.label)}</div>
          <div class="bid-meta-value">${escHtml(f.value)}</div>
        </div>`
      ).join('');
    }

    // Score grid
    if (scoreGrid) {
      const dims = [
        { key: 'spec_flexibility',  label: 'Spec Flexibility', reasonKey: 'spec_flexibility_reason' },
        { key: 'trade_fit',         label: 'Trade Fit',        reasonKey: 'trade_fit_reason' },
        { key: 'bid_friendliness',  label: 'Bid Friendliness', reasonKey: 'bid_friendliness_reason' }
      ];
      scoreGrid.innerHTML = dims.map(d => {
        const n = score[d.key] != null ? score[d.key] : '—';
        const cls = typeof n === 'number' ? scoreClass(n) : '';
        return `<div class="score-card">
          <div class="score-dim">${escHtml(d.label)}</div>
          <div class="score-num ${cls}">${n}<span style="font-size:1rem;font-weight:400;color:#9CA3AF;">/10</span></div>
          <div class="score-reason">${escHtml(score[d.reasonKey] || '')}</div>
        </div>`;
      }).join('');
    }

    // Flags
    const POSITIVE_FLAGS = new Set(['contractor_choice', 'or_equal_language', 'unit_turn_volume']);
    const CAUTION_FLAGS  = new Set(['prevailing_wage', 'bonding_required', 'prequalification_required', 'federal_contract', 'sole_source_spec']);
    if (score.flags && score.flags.length > 0 && flagsCard && flagsRow) {
      flagsRow.innerHTML = score.flags.map(f => {
        const cls = POSITIVE_FLAGS.has(f) ? 'flag-chip positive'
                  : CAUTION_FLAGS.has(f)  ? 'flag-chip caution'
                  : 'flag-chip';
        return `<span class="${cls}">${escHtml(f.replace(/_/g, ' '))}</span>`;
      }).join('');
      show(flagsCard);
    } else {
      hide(flagsCard);
    }

    // OOS
    if (score.out_of_scope_items && score.out_of_scope_items.length > 0 && oosCard && oosList) {
      oosList.innerHTML = score.out_of_scope_items.map(s => `<li>${escHtml(s)}</li>`).join('');
      show(oosCard);
    } else {
      hide(oosCard);
    }
  }

  // --- Submit ---

  async function submitBid() {
    const input = textarea ? textarea.value.trim() : '';
    if (!input) {
      setState(STATES.ERROR, { message: 'Please paste a bid notification before scoring.' });
      return;
    }

    setState(STATES.LOADING);

    try {
      const response = await fetchImpl('/api/bid-score', {
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
        submitBid();
      }
    });
  }

  if (scoreBtn)    scoreBtn.addEventListener('click', submitBid);
  if (errorRetry)  errorRetry.addEventListener('click', () => setState(STATES.INPUT));
  if (newBidBtn)   newBidBtn.addEventListener('click', () => {
    if (textarea)  textarea.value = '';
    if (charCount) charCount.textContent = '0 / ' + MAX_CHARS;
    setState(STATES.INPUT);
  });

  setState(STATES.INPUT);

  return { STATES, escHtml, scoreClass, setState, renderResults, submitBid };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createBidScorer };
} else {
  createBidScorer(document);
}
