// api/estimate.js
// Vercel serverless handler for POST /api/estimate
// Orchestrates: CORS preflight → rate limit check → input validation → Claude call

const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');
const { buildSystemPrompt } = require('../lib/prompt');

const MAX_INPUT_LENGTH = 1000;

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Method guard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Too many requests. Please try again in a minute.' });
  }

  // Input validation
  const input = req.body?.input;
  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: 'missing_input', message: 'Please describe your project.' });
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: 'input_too_long', message: `Project description must be under ${MAX_INPUT_LENGTH} characters.` });
  }

  // Call Claude
  try {
    const systemPrompt = buildSystemPrompt();
    const estimate = await callClaude(input.trim(), systemPrompt);
    return res.status(200).json(estimate);
  } catch (err) {
    console.error('[estimate]', err.message || err);
    if (err.message === 'api_timeout') {
      return res.status(500).json({ error: 'api_timeout', message: 'The estimate took too long. Please try again.' });
    }
    if (err.message === 'invalid_json') {
      return res.status(500).json({ error: 'invalid_json', message: 'Unexpected response format. Please try again.' });
    }
    return res.status(500).json({ error: 'internal_error', message: 'Something went wrong. Please try again.' });
  }
};
