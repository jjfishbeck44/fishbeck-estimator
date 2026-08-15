/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { createBidScorer } = require('../public/js/bid-score');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'bid-score.html'),
  'utf8'
);

const BODY_HTML = HTML
  .match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
  .replace(/<script[\s\S]*?<\/script>/g, '');

const SAMPLE_SCORE = {
  title: 'IFB-2026-042 Unit Turn Painting',
  agency: 'MPHA',
  due_date: '2026-07-15',
  spec_flexibility: 9,
  spec_flexibility_reason: "Contractor's choice throughout.",
  trade_fit: 10,
  trade_fit_reason: "Pure paint and hardware.",
  bid_friendliness: 8,
  bid_friendliness_reason: "No bond, local work.",
  recommendation: 'bid',
  recommendation_one_liner: 'Open spec + pure wheelhouse = strong margin play.',
  out_of_scope_items: [],
  flags: ['contractor_choice', 'unit_turn_volume']
};

function mockResponse(status, body) {
  return { ok: status >= 200 && status < 300, status, json: jest.fn().mockResolvedValue(body) };
}

function setup({ fetch } = {}) {
  document.body.innerHTML = BODY_HTML;
  const api = createBidScorer(document, { fetch: fetch || jest.fn() });
  return {
    api,
    el: {
      textarea:    document.getElementById('bid-input'),
      charCount:   document.getElementById('char-count'),
      scoreBtn:    document.getElementById('score-btn'),
      inputCard:   document.getElementById('input-card'),
      loadingCard: document.getElementById('loading-card'),
      results:     document.getElementById('results-section'),
      errorCard:   document.getElementById('error-card'),
      errorMsg:    document.getElementById('error-message'),
      errorRetry:  document.getElementById('error-retry-btn'),
      newBidBtn:   document.getElementById('new-bid-btn'),
      verdictBanner: document.getElementById('verdict-banner'),
      verdictLabel:  document.getElementById('verdict-label'),
      verdictLiner:  document.getElementById('verdict-liner'),
      bidMeta:     document.getElementById('bid-meta'),
      scoreGrid:   document.getElementById('score-grid'),
      flagsCard:   document.getElementById('flags-card'),
      flagsRow:    document.getElementById('flags-row'),
      oosCard:     document.getElementById('oos-card')
    }
  };
}

// --- Utilities ---

describe('escHtml()', () => {
  test('escapes XSS characters', () => {
    const { api } = setup();
    expect(api.escHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });
  test('handles null/undefined', () => {
    const { api } = setup();
    expect(api.escHtml(null)).toBe('');
  });
});

describe('scoreClass()', () => {
  test('high for ≥7', () => {
    const { api } = setup();
    expect(api.scoreClass(7)).toBe('high');
    expect(api.scoreClass(10)).toBe('high');
  });
  test('medium for 4–6', () => {
    const { api } = setup();
    expect(api.scoreClass(4)).toBe('medium');
    expect(api.scoreClass(6)).toBe('medium');
  });
  test('low for ≤3', () => {
    const { api } = setup();
    expect(api.scoreClass(3)).toBe('low');
    expect(api.scoreClass(0)).toBe('low');
  });
});

// --- Initial state ---

describe('initial DOM state', () => {
  test('input card visible, others hidden', () => {
    const { el } = setup();
    expect(el.inputCard.style.display).not.toBe('none');
    expect(el.loadingCard.style.display).toBe('none');
    expect(el.results.style.display).toBe('none');
    expect(el.errorCard.style.display).toBe('none');
  });
});

// --- State transitions ---

describe('setState()', () => {
  test('LOADING shows spinner', () => {
    const { api, el } = setup();
    api.setState(api.STATES.LOADING);
    expect(el.loadingCard.style.display).not.toBe('none');
    expect(el.inputCard.style.display).toBe('none');
  });

  test('ERROR shows message', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, { message: 'oops' });
    expect(el.errorCard.style.display).not.toBe('none');
    expect(el.errorMsg.textContent).toBe('oops');
  });

  test('RESULTS shows section', () => {
    const { api, el } = setup();
    api.setState(api.STATES.RESULTS, SAMPLE_SCORE);
    expect(el.results.style.display).not.toBe('none');
  });
});

// --- renderResults ---

describe('renderResults()', () => {
  test('shows BID verdict in banner', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.verdictLabel.textContent).toBe('BID');
    expect(el.verdictBanner.className).toMatch(/bid/);
  });

  test('shows SKIP verdict in banner', () => {
    const { api, el } = setup();
    api.renderResults({ ...SAMPLE_SCORE, recommendation: 'skip' });
    expect(el.verdictBanner.className).toMatch(/skip/);
  });

  test('renders one-liner', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.verdictLiner.textContent).toMatch(/margin play/);
  });

  test('renders agency and due date in metadata', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.bidMeta.innerHTML).toMatch(/MPHA/);
    expect(el.bidMeta.innerHTML).toMatch(/2026-07-15/);
  });

  test('renders all three score cards', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.scoreGrid.innerHTML).toMatch(/Spec Flexibility/);
    expect(el.scoreGrid.innerHTML).toMatch(/Trade Fit/);
    expect(el.scoreGrid.innerHTML).toMatch(/Bid Friendliness/);
  });

  test('high score gets "high" class', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.scoreGrid.innerHTML).toMatch(/score-num high/);
  });

  test('shows flags section when flags present', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.flagsCard.style.display).not.toBe('none');
    expect(el.flagsRow.innerHTML).toMatch(/contractor choice/);
  });

  test('hides OOS card when empty', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_SCORE);
    expect(el.oosCard.style.display).toBe('none');
  });

  test('shows OOS card when items present', () => {
    const { api, el } = setup();
    api.renderResults({ ...SAMPLE_SCORE, out_of_scope_items: ['HVAC replacement'] });
    expect(el.oosCard.style.display).not.toBe('none');
    expect(el.oosCard.innerHTML).toMatch(/HVAC/);
  });

  test('escapes XSS in title', () => {
    const { api, el } = setup();
    api.renderResults({ ...SAMPLE_SCORE, title: '<img src=x onerror=alert(1)>' });
    expect(el.bidMeta.innerHTML).not.toMatch(/<img/);
  });
});

// --- submitBid ---

describe('submitBid()', () => {
  test('shows error when textarea empty', async () => {
    const { api, el } = setup();
    el.textarea.value = '';
    await api.submitBid();
    expect(el.errorCard.style.display).not.toBe('none');
  });

  test('happy path renders results', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(200, SAMPLE_SCORE));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'IFB-2026-042 paint all units';
    await api.submitBid();
    expect(el.results.style.display).not.toBe('none');
    expect(mockFetch).toHaveBeenCalledWith('/api/bid-score', expect.objectContaining({ method: 'POST' }));
  });

  test('shows error on 429', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(429, { message: 'Too many requests.' }));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'some bid text';
    await api.submitBid();
    expect(el.errorMsg.textContent).toMatch(/Too many requests/);
  });

  test('shows error on network failure', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('fetch failed'));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'some bid text';
    await api.submitBid();
    expect(el.errorMsg.textContent).toMatch(/Network error/);
  });
});

// --- Button wiring ---

describe('button wiring', () => {
  test('score button fires submitBid', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(200, SAMPLE_SCORE));
    const { el } = setup({ fetch: mockFetch });
    el.textarea.value = 'IFB-2026-042 some bid';
    el.scoreBtn.click();
    await Promise.resolve(); await Promise.resolve();
    expect(mockFetch).toHaveBeenCalled();
  });

  test('Cmd+Enter fires submitBid', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(200, SAMPLE_SCORE));
    const { el } = setup({ fetch: mockFetch });
    el.textarea.value = 'IFB-2026-042 some bid';
    el.textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true }));
    await Promise.resolve(); await Promise.resolve();
    expect(mockFetch).toHaveBeenCalled();
  });

  test('retry button returns to INPUT', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, { message: 'oops' });
    el.errorRetry.click();
    expect(el.inputCard.style.display).not.toBe('none');
  });

  test('new-bid button resets textarea', () => {
    const { api, el } = setup();
    el.textarea.value = 'old bid';
    api.setState(api.STATES.RESULTS, SAMPLE_SCORE);
    el.newBidBtn.click();
    expect(el.textarea.value).toBe('');
    expect(el.inputCard.style.display).not.toBe('none');
  });
});
