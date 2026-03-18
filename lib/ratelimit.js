// lib/ratelimit.js
// Upstash rate limiter wrapper.
// Allows 10 requests per IP per 60-second sliding window.
// Fails OPEN — if Upstash is misconfigured, requests are allowed through
// so the estimator still works during initial setup.

const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');

const REQUESTS_PER_WINDOW = 10;
const WINDOW_SECONDS = 60;

let limiter = null;

function getLimiter() {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(REQUESTS_PER_WINDOW, `${WINDOW_SECONDS} s`),
      analytics: false,
      prefix: 'fishbeck_rl'
    });
  }
  return limiter;
}

async function checkRateLimit(ip) {
  try {
    const rl = getLimiter();
    const { success } = await rl.limit(ip);
    return { allowed: success };
  } catch {
    // Fail open — missing Upstash config should not break the estimator
    return { allowed: true };
  }
}

module.exports = { checkRateLimit };
