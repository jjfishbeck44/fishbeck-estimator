/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { createWorkOrderApp } = require('../public/js/work-order');

const HTML = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'work-order.html'),
  'utf8'
);

const BODY_HTML = HTML
  .match(/<body[^>]*>([\s\S]*)<\/body>/)[1]
  .replace(/<script[\s\S]*?<\/script>/g, '');

const SAMPLE_WO = {
  work_order_number: '490864-02',
  address: '2181 Burr Street, Maplewood MN 55117',
  agency: 'Ascent',
  move_in_date: null,
  scope: [
    {
      task: 'Interior painting — full unit',
      area: 'All rooms',
      quantity: null,
      clearance_sourceable: true,
      spec_note: 'Contractor choice',
      materials_needed: ['paint', 'primer', 'tape']
    },
    {
      task: 'LVP flooring installation',
      area: 'Living room',
      quantity: '220 sqft',
      clearance_sourceable: true,
      spec_note: null,
      materials_needed: ['LVP planks', 'underlayment', 'transition strips']
    }
  ],
  pre_arrival_checklist: [
    'Confirm unit access with property manager',
    'Source paint from clearance stock',
    'Measure living room for LVP order'
  ],
  material_budget: { clearance_low: 100, clearance_high: 200, retail_low: 400, retail_high: 700 },
  total_hours: 18,
  out_of_scope: [],
  flags: ['unit_vacant', 'contractor_choice_materials'],
  pm_notes: null
};

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body)
  };
}

function setup({ fetch } = {}) {
  document.body.innerHTML = BODY_HTML;
  const api = createWorkOrderApp(document, { fetch: fetch || jest.fn() });
  return {
    api,
    el: {
      textarea:      document.getElementById('wo-input'),
      charCount:     document.getElementById('char-count'),
      parseBtn:      document.getElementById('parse-btn'),
      inputCard:     document.getElementById('input-card'),
      loadingCard:   document.getElementById('loading-card'),
      results:       document.getElementById('results-section'),
      errorCard:     document.getElementById('error-card'),
      errorMsg:      document.getElementById('error-message'),
      errorRetry:    document.getElementById('error-retry-btn'),
      newWoBtn:      document.getElementById('new-wo-btn'),
      woMeta:        document.getElementById('wo-meta'),
      flagsSection:  document.getElementById('flags-section'),
      scopeTbody:    document.getElementById('scope-tbody'),
      checklist:     document.getElementById('checklist-list'),
      budgetGrid:    document.getElementById('budget-grid'),
      hoursDisplay:  document.getElementById('hours-display'),
      oosCard:       document.getElementById('oos-card'),
      pmNotesCard:   document.getElementById('pm-notes-card')
    }
  };
}

// --- Utility ---

describe('escHtml()', () => {
  test('escapes angle brackets and ampersands', () => {
    const { api } = setup();
    expect(api.escHtml('<b>x & y</b>')).toBe('&lt;b&gt;x &amp; y&lt;/b&gt;');
  });

  test('returns empty string for falsy input', () => {
    const { api } = setup();
    expect(api.escHtml(null)).toBe('');
    expect(api.escHtml('')).toBe('');
  });
});

describe('fmt() / fmtRange()', () => {
  test('fmt() prepends dollar sign', () => {
    const { api } = setup();
    expect(api.fmt(1500)).toBe('$1,500');
  });

  test('fmtRange() formats a low–high pair', () => {
    const { api } = setup();
    expect(api.fmtRange(100, 200)).toBe('$100 – $200');
  });
});

// --- Initial state ---

describe('initial DOM state', () => {
  test('input card is visible, others hidden', () => {
    const { el } = setup();
    expect(el.inputCard.style.display).not.toBe('none');
    expect(el.loadingCard.style.display).toBe('none');
    expect(el.results.style.display).toBe('none');
    expect(el.errorCard.style.display).toBe('none');
  });
});

// --- Character counter ---

describe('character counter', () => {
  test('updates on input', () => {
    const { el } = setup();
    el.textarea.value = 'hello world';
    el.textarea.dispatchEvent(new Event('input'));
    expect(el.charCount.textContent).toMatch(/11 \/ 5000/);
  });
});

// --- State transitions ---

describe('setState()', () => {
  test('LOADING hides input, shows spinner', () => {
    const { api, el } = setup();
    api.setState(api.STATES.LOADING);
    expect(el.inputCard.style.display).toBe('none');
    expect(el.loadingCard.style.display).not.toBe('none');
  });

  test('ERROR shows error card with message', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, { message: 'Something failed' });
    expect(el.errorCard.style.display).not.toBe('none');
    expect(el.errorMsg.textContent).toBe('Something failed');
  });

  test('RESULTS calls renderResults and shows section', () => {
    const { api, el } = setup();
    api.setState(api.STATES.RESULTS, SAMPLE_WO);
    expect(el.results.style.display).not.toBe('none');
  });
});

// --- renderResults ---

describe('renderResults()', () => {
  test('renders WO number and address in meta', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.woMeta.innerHTML).toMatch(/490864-02/);
    expect(el.woMeta.innerHTML).toMatch(/Maplewood/);
  });

  test('renders clearance badge for sourceable item', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.scopeTbody.innerHTML).toMatch(/Clearance/);
  });

  test('renders pre-arrival checklist items', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.checklist.innerHTML).toMatch(/Confirm unit access/);
  });

  test('renders budget grid with clearance and retail amounts', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.budgetGrid.innerHTML).toMatch(/Clearance Materials/);
    expect(el.budgetGrid.innerHTML).toMatch(/Retail Materials/);
  });

  test('renders estimated hours', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.hoursDisplay.innerHTML).toMatch(/18/);
  });

  test('shows flags section when flags present', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.flagsSection.style.display).not.toBe('none');
    expect(el.flagsSection.innerHTML).toMatch(/unit.vacant/i);
  });

  test('hides OOS card when out_of_scope is empty', () => {
    const { api, el } = setup();
    api.renderResults(SAMPLE_WO);
    expect(el.oosCard.style.display).toBe('none');
  });

  test('shows OOS card when out-of-scope items present', () => {
    const { api, el } = setup();
    api.renderResults({ ...SAMPLE_WO, out_of_scope: ['HVAC replacement'] });
    expect(el.oosCard.style.display).not.toBe('none');
    expect(el.oosCard.innerHTML).toMatch(/HVAC/);
  });

  test('escapes XSS in task names', () => {
    const { api, el } = setup();
    const xssWo = {
      ...SAMPLE_WO,
      scope: [{ ...SAMPLE_WO.scope[0], task: '<script>alert(1)</script>', clearance_sourceable: true }]
    };
    api.renderResults(xssWo);
    expect(el.scopeTbody.innerHTML).not.toMatch(/<script>/);
    expect(el.scopeTbody.innerHTML).toMatch(/&lt;script&gt;/);
  });
});

// --- submitWorkOrder ---

describe('submitWorkOrder()', () => {
  test('shows error when textarea is empty', async () => {
    const { api, el } = setup();
    el.textarea.value = '';
    await api.submitWorkOrder();
    expect(el.errorCard.style.display).not.toBe('none');
  });

  test('happy path: success renders results', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(200, SAMPLE_WO));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'WO 490864-02 paint all rooms';
    await api.submitWorkOrder();
    expect(el.results.style.display).not.toBe('none');
    expect(mockFetch).toHaveBeenCalledWith('/api/work-order', expect.objectContaining({ method: 'POST' }));
  });

  test('shows error on 429', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(429, { error: 'rate_limited', message: 'Too many requests.' }));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'WO 12345 some work';
    await api.submitWorkOrder();
    expect(el.errorCard.style.display).not.toBe('none');
    expect(el.errorMsg.textContent).toMatch(/Too many requests/);
  });

  test('shows error on 500', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(500, { error: 'internal_error', message: 'Something went wrong.' }));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'WO 12345 some work';
    await api.submitWorkOrder();
    expect(el.errorCard.style.display).not.toBe('none');
  });

  test('shows error on network failure', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));
    const { api, el } = setup({ fetch: mockFetch });
    el.textarea.value = 'WO 12345 some work';
    await api.submitWorkOrder();
    expect(el.errorCard.style.display).not.toBe('none');
    expect(el.errorMsg.textContent).toMatch(/Network error/);
  });
});

// --- Button wiring ---

describe('button wiring', () => {
  test('parse button calls submitWorkOrder', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(200, SAMPLE_WO));
    const { el } = setup({ fetch: mockFetch });
    el.textarea.value = 'WO 12345 paint all rooms';
    el.parseBtn.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(mockFetch).toHaveBeenCalled();
  });

  test('Ctrl+Enter triggers submit', async () => {
    const mockFetch = jest.fn().mockResolvedValue(mockResponse(200, SAMPLE_WO));
    const { el } = setup({ fetch: mockFetch });
    el.textarea.value = 'WO 12345 some work';
    el.textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true }));
    await Promise.resolve();
    await Promise.resolve();
    expect(mockFetch).toHaveBeenCalled();
  });

  test('retry button returns to INPUT state', () => {
    const { api, el } = setup();
    api.setState(api.STATES.ERROR, { message: 'oops' });
    el.errorRetry.click();
    expect(el.inputCard.style.display).not.toBe('none');
    expect(el.errorCard.style.display).toBe('none');
  });

  test('new-wo button resets textarea and returns to INPUT', () => {
    const { api, el } = setup();
    el.textarea.value = 'old content';
    api.setState(api.STATES.RESULTS, SAMPLE_WO);
    el.newWoBtn.click();
    expect(el.textarea.value).toBe('');
    expect(el.inputCard.style.display).not.toBe('none');
  });
});
