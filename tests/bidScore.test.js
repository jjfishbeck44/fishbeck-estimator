// tests/bidScore.test.js
jest.mock('../lib/ratelimit', () => ({ checkRateLimit: jest.fn() }));
jest.mock('../lib/claude', () => ({ callClaude: jest.fn() }));
jest.mock('../lib/bidScoringPrompt', () => ({
  buildBidScoringPrompt: jest.fn().mockReturnValue('mock-bid-prompt')
}));

const handler = require('../api/bid-score');
const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');

const SAMPLE_SCORE = {
  title: 'IFB-2026-042 Unit Turn Painting',
  agency: 'MPHA',
  due_date: '2026-07-15',
  spec_flexibility: 9,
  spec_flexibility_reason: 'Contractor\'s choice throughout; no brand named.',
  trade_fit: 10,
  trade_fit_reason: 'Pure paint and hardware — Fishbeck\'s core wheelhouse.',
  bid_friendliness: 8,
  bid_friendliness_reason: 'Local work, no bond requirement, 3-year experience threshold.',
  recommendation: 'bid',
  recommendation_one_liner: 'Open spec + pure wheelhouse = strong margin play.',
  out_of_scope_items: [],
  flags: ['contractor_choice', 'unit_turn_volume', 'or_equal_language']
};

function makeReq(overrides = {}) {
  return {
    method: 'POST',
    headers: { 'x-forwarded-for': '127.0.0.1' },
    body: { input: 'IFB-2026-042 paint all units contractor choice MPHA' },
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

describe('POST /api/bid-score', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 405 for non-POST', async () => {
    const res = makeRes();
    await handler(makeReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });

  test('returns 200 for OPTIONS', async () => {
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

  test('returns 400 when input missing', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing_input');
  });

  test('returns 400 when input blank', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ body: { input: '   ' } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('missing_input');
  });

  test('returns 400 when input exceeds 8000 chars', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    const res = makeRes();
    await handler(makeReq({ body: { input: 'x'.repeat(8001) } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('input_too_long');
  });

  test('accepts input up to 8000 chars', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockResolvedValue(SAMPLE_SCORE);
    const res = makeRes();
    await handler(makeReq({ body: { input: 'x'.repeat(8000) } }), res);
    expect(res.statusCode).toBe(200);
  });

  test('returns 200 with score on success', async () => {
    checkRateLimit.mockResolvedValue({ allowed: true });
    callClaude.mockResolvedValue(SAMPLE_SCORE);
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(SAMPLE_SCORE);
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
    callClaude.mockRejectedValue(new Error('boom'));
    const res = makeRes();
    await handler(makeReq(), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('internal_error');
  });
});

describe('buildBidScoringPrompt()', () => {
  const { buildBidScoringPrompt } = require('../lib/bidScoringPrompt');

  beforeEach(() => buildBidScoringPrompt.mockRestore && buildBidScoringPrompt.mockRestore());

  test('prompt module exports the function', () => {
    jest.resetModules();
    const { buildBidScoringPrompt: real } = require('../lib/bidScoringPrompt');
    expect(typeof real).toBe('function');
  });
});
