// api/estimate.js
// Vercel serverless handler for POST /api/estimate
// Orchestrates: CORS preflight → rate limit check → input validation → Claude call

const { checkRateLimit } = require('../lib/ratelimit');
const { callClaude } = require('../lib/claude');
const { buildSystemPrompt } = require('../lib/prompt');

const MAX_INPUT_LENGTH = 1000;

function normalizeEstimate(raw) {
  const status = raw.status === 'clarification_needed' ? 'clarification_needed' : 'estimate';
  return {
    status,
    clarification_message: raw.clarification_message || null,
    line_items: Array.isArray(raw.line_items)
      ? raw.line_items.map(item => ({
          label: String(item.label || ''),
          description: String(item.description || ''),
          range_low: Number(item.range_low) || 0,
          range_high: Number(item.range_high) || 0
        }))
      : [],
    total_low: Number(raw.total_low) || 0,
    total_high: Number(raw.total_high) || 0,
    notes: raw.notes || null,
    out_of_scope: Array.isArray(raw.out_of_scope) ? raw.out_of_scope.map(String) : []
  };
}

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
    const raw = await callClaude(input.trim(), systemPrompt);
    const estimate = normalizeEstimate(raw);
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
