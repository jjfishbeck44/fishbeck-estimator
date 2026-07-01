// tests/workOrder.test.js
jest.mock('../lib/ratelimit', () => ({
  checkRateLimit: jest.fn()
}));
jest.mock('../lib/claude', () => ({
  callClaude: jest.fn()
}));
jest.mock('../lib/workOrderPrompt', () => ({
  buildWorkOrderPrompt: jest.fn().mockReturnValue('mock-wo-prompt')
}));

const handler = require('../api/work-order');
const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');

const SAMPLE_RESULT = {
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
    }
  ],
  pre_arrival_checklist: ['Confirm unit access with property manager', 'Source paint from clearance stock'],
  material_budget: { clearance_low: 60, clearance_high: 130, retail_low: 300, retail_high: 550 },
  total_hours: 14,
  out_of_scope: [],
  flags: ['unit_vacant', 'contractor_choice_materials'],
  pm_notes: null
};

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: { input: 'WO 490864-02 — paint all rooms contractor choice, 2181 Burr St Maplewood' },
    ...overrides
  };
}

function makeRes() {
  const res = { statusCode: null, body: null };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((data) => { res.body = data; return res; });
  res.end = jest.fn(() => res);
  return res;
}

describe('POST /api/work-order', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 405 for non-POST requests', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });

  test('returns 200 for OPTIONS preflight', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'OPTIONS' }), res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 429 when rate limited', async () => {
    checkRateLimit.mockResolvedValue({ allowed: false });
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe('rate_limited');
  });

  test('returns 400 when input is missing', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing_input');
  });

  test('returns 400 when input is blank', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ body: { input: '   ' } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing_input');
  });

  test('returns 400 when input exceeds 5000 chars', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ body: { input: 'x'.repeat(5001) } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('input_too_long');
  });

  test('accepts input up to 5000 chars', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockResolvedValue(SAMPLE_RESULT);
    const res = makeRes();
    await handler(makeReq({ body: { input: 'x'.repeat(5000) } }), res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 200 with parsed work order on success', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockResolvedValue(SAMPLE_RESULT);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(SAMPLE_RESULT);
  });

  test('returns 500 on api_timeout', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockRejectedValue(new Error('api_timeout'));
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('api_timeout');
  });

  test('returns 500 on invalid_json', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockRejectedValue(new Error('invalid_json'));
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('invalid_json');
  });

  test('returns 500 on unexpected error', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockRejectedValue(new Error('something broke'));
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('internal_error');
  });
});
