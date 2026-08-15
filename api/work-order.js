// api/work-order.js
// Vercel serverless handler for POST /api/work-order
// Parses an Ascent work order and returns a structured job-prep breakdown.

const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');
const { buildWorkOrderPrompt } = require('../lib/workOrderPrompt');

const MAX_INPUT_LENGTH = 5000;

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
    return res.status(400).json({ error: 'missing_input', message: 'Please paste a work order.' });
  }
  if (input.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: 'input_too_long', message: `Work order must be under ${MAX_INPUT_LENGTH} characters.` });
  }

  try {
    const systemPrompt = buildWorkOrderPrompt();
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
