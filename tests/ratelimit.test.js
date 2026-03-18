// tests/ratelimit.test.js
jest.mock('@upstash/ratelimit', () => {
  const mockLimit = jest.fn();
  const Ratelimit = jest.fn().mockImplementation(() => ({ limit: mockLimit }));
  Ratelimit.slidingWindow = jest.fn().mockReturnValue('sliding-window-config');
  Ratelimit._mockLimit = mockLimit;
  return { Ratelimit };
});

jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue('redis-instance')
  }
}));

const { checkRateLimit } = require('../lib/ratelimit');
const { Ratelimit } = require('@upstash/ratelimit');

describe('checkRateLimit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns { allowed: true } when under limit', async () => {
    Ratelimit._mockLimit.mockResolvedValue({ success: true });
    const result = await checkRateLimit('127.0.0.1');
    expect(result).toEqual({ allowed: true });
  });

  test('returns { allowed: false } when over limit', async () => {
    Ratelimit._mockLimit.mockResolvedValue({ success: false });
    const result = await checkRateLimit('127.0.0.1');
    expect(result).toEqual({ allowed: false });
  });

  test('passes the IP address to the limiter', async () => {
    Ratelimit._mockLimit.mockResolvedValue({ success: true });
    await checkRateLimit('203.0.113.42');
    expect(Ratelimit._mockLimit).toHaveBeenCalledWith('203.0.113.42');
  });

  test('returns { allowed: true } when Upstash env vars are missing (fail open)', async () => {
    Ratelimit._mockLimit.mockRejectedValue(new Error('missing env vars'));
    const result = await checkRateLimit('127.0.0.1');
    expect(result).toEqual({ allowed: true });
  });
});
