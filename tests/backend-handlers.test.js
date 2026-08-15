// Handler tests for the new backend endpoints (deps mocked, no network).
jest.mock('../lib/ratelimit', () => ({ checkRateLimit: jest.fn() }));
jest.mock('../lib/geocode', () => ({ getDistanceMiles: jest.fn() }));
jest.mock('../lib/email', () => ({ sendEmail: jest.fn() }));

const { checkRateLimit } = require('../lib/ratelimit');
const { getDistanceMiles } = require('../lib/geocode');
const { sendEmail } = require('../lib/email');
const travel = require('../api/travel-distance');
const quote = require('../api/custom-quote');

function makeReq(o = {}) { return { method: 'POST', headers: { 'x-forwarded-for': '1.1.1.1' }, body: {}, ...o }; }
function makeRes() {
  const res = { statusCode: null, body: null };
  res.status = jest.fn((c) => { res.statusCode = c; return res; });
  res.json = jest.fn((d) => { res.body = d; return res; });
  res.end = jest.fn(() => res);
  return res;
}

beforeEach(() => {
  checkRateLimit.mockResolvedValue({ allowed: true });
  getDistanceMiles.mockReset();
  sendEmail.mockReset();
});

describe('POST /api/travel-distance', () => {
  test('405 for non-POST', async () => {
    const res = makeRes();
    await travel(makeReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });
  test('400 when address missing', async () => {
    const res = makeRes();
    await travel(makeReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
  });
  test('200 with miles on success', async () => {
    getDistanceMiles.mockResolvedValue({ miles: 22.5, displayName: 'Eagan, MN' });
    const res = makeRes();
    await travel(makeReq({ body: { address: 'Eagan, MN' } }), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.miles).toBe(22.5);
  });
  test('404 when address not found', async () => {
    getDistanceMiles.mockRejectedValue(new Error('not_found'));
    const res = makeRes();
    await travel(makeReq({ body: { address: 'zzz' } }), res);
    expect(res.statusCode).toBe(404);
  });
  test('429 when rate limited', async () => {
    checkRateLimit.mockResolvedValue({ allowed: false });
    const res = makeRes();
    await travel(makeReq({ body: { address: 'x' } }), res);
    expect(res.statusCode).toBe(429);
  });
});

describe('POST /api/custom-quote', () => {
  const good = { name: 'Sam', email: 'sam@example.com', description: 'New deck, ~200 sq ft.' };

  test('400 when required fields missing', async () => {
    const res = makeRes();
    await quote(makeReq({ body: { name: 'Sam' } }), res);
    expect(res.statusCode).toBe(400);
  });
  test('400 on invalid email', async () => {
    const res = makeRes();
    await quote(makeReq({ body: { ...good, email: 'not-an-email' } }), res);
    expect(res.statusCode).toBe(400);
  });
  test('200 and sends email on success', async () => {
    sendEmail.mockResolvedValue({ id: 'abc' });
    const res = makeRes();
    await quote(makeReq({ body: good }), res);
    expect(res.statusCode).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const arg = sendEmail.mock.calls[0][0];
    expect(arg.replyTo).toBe('sam@example.com');
    expect(arg.to).toContain('fishbeckinnovations.com');
  });
  test('503 when email not configured', async () => {
    sendEmail.mockRejectedValue(new Error('email_not_configured'));
    const res = makeRes();
    await quote(makeReq({ body: good }), res);
    expect(res.statusCode).toBe(503);
  });
});
