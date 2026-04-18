/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

const { createEstimator } = require('../public/js/estimator');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'index.html'),
  'utf8'
);

// Extract just the <body> contents so we can inject into the jsdom document
// without doubling up <html>/<head>. Strip the <script> tag too — we'll wire
// the estimator manually through createEstimator().
const BODY_HTML = HTML
  .match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
  .replace(/<script[\s\S]*?<\/script>/g, '');

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status: status,
    json: jest.fn().mockResolvedValue(body)
  };
}

function makeFetch(...responses) {
  const fn = jest.fn();
  responses.forEach((r) => {
    if (r instanceof Error) fn.mockRejectedValueOnce(r);
    else fn.mockResolvedValueOnce(r);
  });
  return fn;
}

function setup({ fetch } = {}) {
  document.body.innerHTML = BODY_HTML;
  const api = createEstimator(document, { fetch: fetch || jest.fn() });
  return {
    api,
    el: {
      textarea: document.getElementById('project-input'),
      charCount: document.getElementById('char-count'),
      charCounter: document.querySelector('.char-counter'),
      estimateBtn: document.getElementById('estimate-btn'),
      inputCard: document.getElementById('input-card'),
      loadingCard: document.getElementById('loading-card'),
      clarificationCard: document.getElementById('clarification-card'),
      clarificationMsg: document.getElementById('clarification-message'),
      clarificationBackBtn: document.getElementById('clarification-back-btn'),
      resultsSection: document.getElementById('results-section'),
      bannerRange: document.getElementById('banner-range'),
      scopeTbody: document.getElementById('scope-tbody'),
      totalRangeCell: document.getElementById('total-range-cell'),
      notesCard: document.getElementById('notes-card'),
      notesText: document.getElementById('notes-text'),
      outOfScopeCard: document.getElementById('out-of-scope-card'),
      outOfScopeList: document.getElementById('out-of-scope-list'),
      newEstimateBtn: document.getElementById('new-estimate-btn'),
      errorCard: document.getElementById('error-card'),
      errorMessage: document.getElementById('error-message'),
      errorRetryBtn: document.getElementById('error-retry-btn')
    }
  };
}

const isHidden = (el) => el.classList.contains('hidden');
const isVisible = (el) => !el.classList.contains('hidden');

describe('escHtml()', () => {
  test('escapes < and > and &', () => {
    const { api } = setup();
    expect(api.escHtml('<script>alert(1)</script>'))
      .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(api.escHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });

  test('returns plain text unchanged', () => {
    const { api } = setup();
    expect(api.escHtml('hello world')).toBe('hello world');
  });

  test('handles empty string', () => {
    const { api } = setup();
    expect(api.escHtml('')).toBe('');
  });
});

describe('fmt() / fmtRange()', () => {
  test('formats integers with $ and commas', () => {
    const { api } = setup();
    expect(api.fmt(1500)).toBe('$1,500');
    expect(api.fmt(0)).toBe('$0');
    expect(api.fmt(1234567)).toBe('$1,234,567');
  });

  test('rounds floats', () => {
    const { api } = setup();
    expect(api.fmt(1499.4)).toBe('$1,499');
    expect(api.fmt(1499.6)).toBe('$1,500');
  });

  test('fmtRange joins low and high with en-dash', () => {
    const { api } = setup();
    expect(api.fmtRange(900, 2100)).toBe('$900 \u2013 $2,100');
  });
});

describe('initial DOM state', () => {
  test('input card visible, all transient cards hidden', () => {
    const { el } = setup();
    expect(isVisible(el.inputCard)).toBe(true);
    expect(isHidden(el.loadingCard)).toBe(true);
    expect(isHidden(el.clarificationCard)).toBe(true);
    expect(isHidden(el.resultsSection)).toBe(true);
    expect(isHidden(el.errorCard)).toBe(true);
  });
});

describe('setState() transitions', () => {
  test('LOADING shows loading card only', () => {
    const { api, el } = setup();
    api.setState(api.STATES.LOADING);
    expect(isVisible(el.loadingCard)).toBe(true);
    expect(isHidden(el.inputCard)).toBe(true);
    expect(isHidden(el.errorCard)).toBe(true);
    expect(api.getCurrentState()).toBe('loading');
  });

  test('CLARIFICATION shows input + clarification with message', () => {
    const { api, el } = setup();
    api.setState(api.STATES.CLARIFICATION, { message: 'What size unit?' });
    expect(isVisible(el.inputCard)).toBe(true);
    expect(isVisible(el.clarificationCard)).toBe(true);
    expect(el.clarificationMsg.textContent).toBe('What size unit?');
  });

  test('CLARIFICATION uses default message when none provided', () => {
    const { api, el } = setup();
    api.setState(api.STATES.CLARIFICATION, {});
    expect(el.clarificationMsg.textContent).toMatch(/more detail/i);
  });

  test('ERROR shows input + error with message', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, { message: 'Boom.' });
    expect(isVisible(el.inputCard)).toBe(true);
    expect(isVisible(el.errorCard)).toBe(true);
    expect(el.errorMessage.textContent).toBe('Boom.');
  });

  test('ERROR uses default message when none provided', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, {});
    expect(el.errorMessage.textContent).toMatch(/something went wrong/i);
  });
});

describe('renderResults()', () => {
  const fullEstimate = {
    status: 'estimate',
    line_items: [
      { label: 'Unit Turn', description: 'Standard repaint + clean', range_low: 800, range_high: 1500 },
      { label: 'LVP Flooring', description: '600 sq ft installed', range_low: 1800, range_high: 3000 }
    ],
    total_low: 2600,
    total_high: 4500,
    notes: 'Assumes 1 BR units.',
    out_of_scope: ['HVAC', 'Electrical panel work']
  };

  test('renders banner, line items, total, notes, and out-of-scope', () => {
    const { api, el } = setup();
    api.renderResults(fullEstimate);

    expect(el.bannerRange.textContent).toBe('$2,600 \u2013 $4,500');
    expect(el.totalRangeCell.textContent).toBe('$2,600 \u2013 $4,500');

    const rows = el.scopeTbody.querySelectorAll('tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].querySelector('.item-label').textContent).toBe('Unit Turn');
    expect(rows[0].querySelector('.item-desc').textContent).toBe('Standard repaint + clean');
    expect(rows[0].querySelector('.item-range').textContent).toBe('$800 \u2013 $1,500');

    expect(isVisible(el.notesCard)).toBe(true);
    expect(el.notesText.textContent).toBe('Assumes 1 BR units.');

    expect(isVisible(el.outOfScopeCard)).toBe(true);
    const oosItems = el.outOfScopeList.querySelectorAll('li');
    expect(oosItems).toHaveLength(2);
    expect(oosItems[0].textContent).toBe('HVAC');
    expect(oosItems[1].textContent).toBe('Electrical panel work');
  });

  test('hides notes card when notes is null', () => {
    const { api, el } = setup();
    api.renderResults({ ...fullEstimate, notes: null });
    expect(isHidden(el.notesCard)).toBe(true);
  });

  test('hides out-of-scope card when list is empty', () => {
    const { api, el } = setup();
    api.renderResults({ ...fullEstimate, out_of_scope: [] });
    expect(isHidden(el.outOfScopeCard)).toBe(true);
  });

  test('handles missing line_items array', () => {
    const { api, el } = setup();
    api.renderResults({ total_low: 0, total_high: 0, line_items: undefined });
    expect(el.scopeTbody.querySelectorAll('tr')).toHaveLength(0);
  });

  test('escapes HTML in line item label and description', () => {
    const { api, el } = setup();
    api.renderResults({
      total_low: 100,
      total_high: 200,
      line_items: [{
        label: '<img src=x onerror=alert(1)>',
        description: '"></td><script>alert(2)</script>',
        range_low: 100,
        range_high: 200
      }]
    });
    expect(el.scopeTbody.querySelectorAll('script')).toHaveLength(0);
    expect(el.scopeTbody.querySelectorAll('img')).toHaveLength(0);
    expect(el.scopeTbody.querySelector('.item-label').textContent)
      .toBe('<img src=x onerror=alert(1)>');
  });
});

describe('character counter', () => {
  function fireInput(textarea, value) {
    textarea.value = value;
    textarea.dispatchEvent(new window.Event('input', { bubbles: true }));
  }

  test('updates count and applies no class under 750', () => {
    const { el } = setup();
    fireInput(el.textarea, 'a'.repeat(100));
    expect(el.charCount.textContent).toBe('100');
    expect(el.charCounter.classList.contains('warn')).toBe(false);
    expect(el.charCounter.classList.contains('error')).toBe(false);
  });

  test('applies warn class above 750', () => {
    const { el } = setup();
    fireInput(el.textarea, 'a'.repeat(800));
    expect(el.charCount.textContent).toBe('800');
    expect(el.charCounter.classList.contains('warn')).toBe(true);
    expect(el.charCounter.classList.contains('error')).toBe(false);
  });

  test('applies error class above 900', () => {
    const { el } = setup();
    fireInput(el.textarea, 'a'.repeat(950));
    expect(el.charCount.textContent).toBe('950');
    expect(el.charCounter.classList.contains('error')).toBe(true);
    expect(el.charCounter.classList.contains('warn')).toBe(false);
  });

  test('clears warn/error when shrinking below thresholds', () => {
    const { el } = setup();
    fireInput(el.textarea, 'a'.repeat(950));
    fireInput(el.textarea, 'a'.repeat(100));
    expect(el.charCounter.classList.contains('warn')).toBe(false);
    expect(el.charCounter.classList.contains('error')).toBe(false);
  });
});

describe('submitEstimate() — empty input', () => {
  test('does not call fetch and stays on input card', async () => {
    const fetchMock = jest.fn();
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = '   ';
    await api.submitEstimate();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isVisible(el.inputCard)).toBe(true);
    expect(isHidden(el.loadingCard)).toBe(true);
  });
});

describe('submitEstimate() — happy path', () => {
  test('renders results from a successful estimate response', async () => {
    const estimate = {
      status: 'estimate',
      line_items: [{ label: 'Paint', description: '3 units', range_low: 900, range_high: 2100 }],
      total_low: 900,
      total_high: 2100,
      notes: null,
      out_of_scope: []
    };
    const fetchMock = makeFetch(mockResponse(200, estimate));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'Paint 3 units in St. Paul';

    await api.submitEstimate();

    expect(fetchMock).toHaveBeenCalledWith('/api/estimate', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'Paint 3 units in St. Paul' })
    }));
    expect(isVisible(el.resultsSection)).toBe(true);
    expect(el.bannerRange.textContent).toBe('$900 \u2013 $2,100');
    expect(api.getCurrentState()).toBe('results');
    expect(el.estimateBtn.disabled).toBe(false);
    expect(el.estimateBtn.classList.contains('is-loading')).toBe(false);
  });

  test('shows clarification card when status=clarification_needed', async () => {
    const fetchMock = makeFetch(mockResponse(200, {
      status: 'clarification_needed',
      clarification_message: 'How many bedrooms?'
    }));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint a unit';

    await api.submitEstimate();

    expect(isVisible(el.clarificationCard)).toBe(true);
    expect(el.clarificationMsg.textContent).toBe('How many bedrooms?');
    expect(api.getCurrentState()).toBe('clarification');
  });
});

describe('submitEstimate() — error responses', () => {
  test('429 surfaces rate-limit message', async () => {
    const fetchMock = makeFetch(mockResponse(429, { error: 'rate_limited' }));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint';

    await api.submitEstimate();

    expect(isVisible(el.errorCard)).toBe(true);
    expect(el.errorMessage.textContent).toMatch(/too many requests/i);
  });

  test('400 input_too_long surfaces length-specific message', async () => {
    const fetchMock = makeFetch(mockResponse(400, { error: 'input_too_long' }));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'a'.repeat(1500);

    await api.submitEstimate();

    expect(isVisible(el.errorCard)).toBe(true);
    expect(el.errorMessage.textContent).toMatch(/under 1,000 characters/i);
  });

  test('500 falls through to the generic message', async () => {
    const fetchMock = makeFetch(mockResponse(500, { error: 'internal_error', message: 'Server hiccup' }));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint';

    await api.submitEstimate();

    expect(isVisible(el.errorCard)).toBe(true);
    expect(el.errorMessage.textContent).toBe('Server hiccup');
  });

  test('500 with no message uses fallback copy', async () => {
    const fetchMock = makeFetch(mockResponse(500, { error: 'internal_error' }));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint';

    await api.submitEstimate();

    expect(el.errorMessage.textContent).toMatch(/something went wrong/i);
  });

  test('fetch rejection (network failure) surfaces network message', async () => {
    const fetchMock = makeFetch(new Error('ECONNREFUSED'));
    const { api, el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint';

    await api.submitEstimate();

    expect(isVisible(el.errorCard)).toBe(true);
    expect(el.errorMessage.textContent).toMatch(/network error/i);
    expect(el.estimateBtn.disabled).toBe(false);
  });
});

describe('button wiring', () => {
  test('clicking estimate-btn triggers submit (calls fetch)', async () => {
    const fetchMock = makeFetch(mockResponse(200, {
      status: 'estimate', line_items: [], total_low: 0, total_high: 0, notes: null, out_of_scope: []
    }));
    const { el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint a unit';
    el.estimateBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    // Allow the async submit handler to settle
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('Ctrl+Enter in textarea triggers submit', async () => {
    const fetchMock = makeFetch(mockResponse(200, {
      status: 'estimate', line_items: [], total_low: 0, total_high: 0, notes: null, out_of_scope: []
    }));
    const { el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint a unit';
    el.textarea.dispatchEvent(new window.KeyboardEvent('keydown', {
      key: 'Enter', ctrlKey: true, bubbles: true
    }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('Cmd+Enter (metaKey) in textarea also triggers submit', async () => {
    const fetchMock = makeFetch(mockResponse(200, {
      status: 'estimate', line_items: [], total_low: 0, total_high: 0, notes: null, out_of_scope: []
    }));
    const { el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint a unit';
    el.textarea.dispatchEvent(new window.KeyboardEvent('keydown', {
      key: 'Enter', metaKey: true, bubbles: true
    }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('plain Enter does NOT submit', async () => {
    const fetchMock = jest.fn();
    const { el } = setup({ fetch: fetchMock });
    el.textarea.value = 'paint a unit';
    el.textarea.dispatchEvent(new window.KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true
    }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('clarification "back" button returns to INPUT state', () => {
    const { api, el } = setup();
    api.setState(api.STATES.CLARIFICATION, { message: 'why?' });
    el.clarificationBackBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(api.getCurrentState()).toBe('input');
    expect(isHidden(el.clarificationCard)).toBe(true);
  });

  test('error retry button returns to INPUT state', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, { message: 'oops' });
    el.errorRetryBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(api.getCurrentState()).toBe('input');
    expect(isHidden(el.errorCard)).toBe(true);
  });

  test('"new estimate" button clears textarea and returns to INPUT', () => {
    const { api, el } = setup();
    el.textarea.value = 'previous text';
    el.charCount.textContent = '13';
    api.setState(api.STATES.RESULTS, {
      line_items: [], total_low: 0, total_high: 0, notes: null, out_of_scope: []
    });
    el.newEstimateBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(el.textarea.value).toBe('');
    expect(el.charCount.textContent).toBe('0');
    expect(api.getCurrentState()).toBe('input');
  });
});
