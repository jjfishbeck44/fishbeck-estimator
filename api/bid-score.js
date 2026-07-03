// api/bid-score.js
// Vercel serverless handler for POST /api/bid-score
// Scores a single bid notification and returns BID / REVIEW / SKIP verdict.

const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');
const { buildBidScoringPrompt } = require('../lib/bidScoringPrompt');

const MAX_INPUT_LENGTH = 8000;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Too many requests. Please try again in a minute.' });
  }

  const input = req.body?.input;
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: 'missing_input', message: 'Please paste a bid notification.' });
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: 'input_too_long', message: `Bid text must be under ${MAX_INPUT_LENGTH} characters.` });
  }

  try {
    const systemPrompt = buildBidScoringPrompt();
    const result = await callClaude(input.trim(), systemPrompt);
    return res.status(200).json(result);
  } catch (err) {
    if (err.message === 'api_timeout') {
      return res.status(500).json({ error: 'api_timeout', message: 'The request took too long. Please try again.' });
    }
    if (err.message === 'invalid_json') {
      return res.status(500).json({ error: 'invalid_json', message: 'Unexpected response format. Please try again.' });
    }
    return res.status(500).json({ error: 'internal_error', message: 'Something went wrong. Please try again.' });
  }
};
