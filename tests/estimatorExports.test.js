/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');
const { createEstimator } = require('../public/js/estimator');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const BODY_HTML = HTML.match(/<body[^>]*>([\s\S]*)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, '');

const EST_A = { status: 'estimate', line_items: [
  { label: 'Painting', description: 'd', range_low: 1000, range_high: 2000 },
  { label: 'Flooring', description: 'd', range_low: 500, range_high: 900 }
], total_low: 1500, total_high: 2900, notes: null, out_of_scope: [] };
const EST_B = { status: 'estimate', line_items: [
  { label: 'Painting', description: 'd', range_low: 800, range_high: 1500 },
  { label: 'Roof patch', description: 'd', range_low: 300, range_high: 600 }
], total_low: 1100, total_high: 2100, notes: null, out_of_scope: [] };
const EST_C = { ...EST_A, total_low: 3000, total_high: 5000 };

function seed(entries) {
  localStorage.setItem('fishbeck_estimates', JSON.stringify(entries));
}
function entry(ts, name, estimate) {
  return { input: 'job ' + name, estimate, timestamp: ts, refId: 'FI-' + name, name };
}
function setup() {
  document.body.innerHTML = BODY_HTML;
  createEstimator(document, { fetch: jest.fn() });
}
const boxes = () => Array.from(document.querySelectorAll('.history-compare'));
const tick = (i) => { const b = boxes()[i]; b.checked = !b.checked; b.dispatchEvent(new Event('change')); };
const card = () => document.getElementById('comparison-card');

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

describe('history comparison', () => {
  test('card stays hidden until two estimates are ticked', () => {
    seed([entry(3, 'A', EST_A), entry(2, 'B', EST_B)]);
    setup();
    expect(card().classList.contains('hidden')).toBe(true);
    tick(0);
    expect(card().classList.contains('hidden')).toBe(true);
    tick(1);
    expect(card().classList.contains('hidden')).toBe(false);
  });

  test('renders union of line items, dashes for missing, and flags the lowest total', () => {
    seed([entry(3, 'A', EST_A), entry(2, 'B', EST_B)]);
    setup();
    tick(0); tick(1);
    const text = document.getElementById('comparison-body').textContent;
    ['Painting', 'Flooring', 'Roof patch', 'FI-A', 'FI-B'].forEach((t) => expect(text).toContain(t));
    expect(text).toContain('—');
    const best = document.querySelectorAll('.cmp-best');
    expect(best).toHaveLength(1);
    expect(best[0].closest('td').textContent).toContain('$1,100');
  });

  test('caps selection at 4', () => {
    seed([1, 2, 3, 4, 5].map((n) => entry(n, 'E' + n, EST_A)));
    setup();
    [0, 1, 2, 3, 4].forEach(tick);
    expect(boxes().filter((b) => b.checked)).toHaveLength(4);
    expect(document.getElementById('toast').textContent).toMatch(/up to 4/);
  });

  test('Close clears selection; deleting an entry updates the comparison', () => {
    seed([entry(3, 'A', EST_A), entry(2, 'B', EST_B), entry(1, 'C', EST_C)]);
    setup();
    tick(0); tick(1);
    document.querySelectorAll('.history-delete')[1].click();
    expect(card().classList.contains('hidden')).toBe(true);
    expect(boxes().map((b) => b.checked)).toEqual([true, false]); // A stays selected
    tick(1);
    expect(card().classList.contains('hidden')).toBe(false);
    document.getElementById('close-comparison-btn').click();
    expect(card().classList.contains('hidden')).toBe(true);
    expect(boxes().every((b) => !b.checked)).toBe(true);
  });

  test('ticking a checkbox does not open the estimate', () => {
    seed([entry(3, 'A', EST_A), entry(2, 'B', EST_B)]);
    setup();
    boxes()[0].click();
    expect(document.getElementById('results-section').classList.contains('hidden')).toBe(true);
  });

  test('escapes project names', () => {
    seed([entry(3, '<img src=x onerror=alert(1)>', EST_A), entry(2, 'B', EST_B)]);
    setup();
    tick(0); tick(1);
    expect(document.querySelector('#comparison-body img')).toBeNull();
  });
});

describe('PDF button', () => {
  test('downloads a .pdf named with the ref id', () => {
    seed([entry(3, 'A', EST_A)]);
    setup();
    let blob, filename;
    URL.createObjectURL = jest.fn((b) => { blob = b; return 'blob:x'; });
    URL.revokeObjectURL = jest.fn();
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () { filename = this.download; };
    document.querySelector('.history-item').click();      // open estimate
    document.getElementById('download-pdf-btn').click();
    HTMLAnchorElement.prototype.click = orig;
    expect(blob.type).toBe('application/pdf');
    expect(filename).toMatch(/^fishbeck-estimate-FI-A.*\.pdf$/);
    expect(document.getElementById('toast').textContent).toBe('PDF downloaded');
  });
});
