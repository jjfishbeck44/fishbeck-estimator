// tests/estimate.test.js
jest.mock('../lib/ratelimit', () => ({
  checkRateLimit: jest.fn()
}));
jest.mock('../lib/claude', () => ({
  callClaude: jest.fn()
}));
jest.mock('../lib/prompt', () => ({
  buildSystemPrompt: jest.fn().mockReturnValue('mock-system-prompt')
}));

const handler = require('../api/estimate');
const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: { input: 'paint 3 units in St. Paul' },
    ...overrides
  };
}

function makeRes() {
  const res = {
    statusCode: null,
    body: null,
    headers: {}
  };
  res.status = jest.fn((code) => { res.statusCode = code; return res; });
  res.json = jest.fn((data) => { res.body = data; return res; });
  res.setHeader = jest.fn((k, v) => { res.headers[k] = v; return res; });
  res.end = jest.fn(() => res);
  return res;
}

describe('POST /api/estimate', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 405 for non-POST requests', async () => {
    const req = makeReq({ method: 'GET' });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  test('returns 200 with OPTIONS (preflight)', async () => {
    const req = makeReq({ method: 'OPTIONS' });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 429 when rate limit exceeded', async () => {
    checkRateLimit.mockResolvedValue({ allowed: false });
    const req = makeReq();
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe('rate_limited');
  });

  test('returns 400 when input is missing', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const req = makeReq({ body: {} });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing_input');
  });

  test('returns 400 when input is empty string', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const req = makeReq({ body: { input: '   ' } });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing_input');
  });

  test('returns 400 when input exceeds 1000 chars', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const req = makeReq({ body: { input: 'a'.repeat(1001) } });
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('input_too_long');
  });

  test('returns 200 with estimate on success', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const fakeEstimate = {
      status: 'estimate',
      clarification_message: null,
      line_items: [{ label: 'Paint × 3', description: 'Interior repaint', range_low: 900, range_high: 2100 }],
      total_low: 900,
      total_high: 2100,
      notes: null,
      out_of_scope: []
    };
    callClaude.mockResolvedValue(fakeEstimate);
    const req = makeReq();
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(fakeEstimate);
  });

  test('returns 500 on api_timeout', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockRejectedValue(new Error('api_timeout'));
    const req = makeReq();
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('api_timeout');
  });

  test('returns 500 on invalid_json', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockRejectedValue(new Error('invalid_json'));
    const req = makeReq();
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('invalid_json');
  });

  test('returns 500 on unexpected error', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockRejectedValue(new Error('something broke'));
    const req = makeReq();
    const res = makeRes();
    await handler(req, res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('internal_error');
  });
});
