// bid-scorer/lib/scoreBid.js
// Scores a bid notification using Claude. Takes the notification email body
// and (optionally) extracted spec PDF text; returns a structured evaluation.

const Anthropic = require('@anthropic-ai/sdk');
const { buildBidScorerPrompt } = require('./prompt');

const TIMEOUT_MS = 45000;
const MODEL = 'claude-sonnet-4-6';

let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

function formatUserMessage(bid) {
  const parts = [
    '=== BID NOTIFICATION ===',
    bid.subject ? `Subject: ${bid.subject}` : null,
    bid.agency ? `Agency: ${bid.agency}` : null,
    bid.postedAt ? `Posted: ${bid.postedAt}` : null,
    bid.dueAt ? `Due: ${bid.dueAt}` : null,
    '',
    '--- Notification body ---',
    bid.body || '(no body provided)'
  ].filter((line) => line !== null);

  if (bid.specText) {
    parts.push('', '--- Spec excerpt ---', bid.specText);
  }

  return parts.join('\n');
}

async function scoreBid(bid, opts) {
  opts = opts || {};
  const client = opts.client || getClient();
  const systemPrompt = buildBidScorerPrompt();
  const userMessage = formatUserMessage(bid);

  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('api_timeout')), TIMEOUT_MS);
  });

  const apiPromise = client.messages.create({
    model: opts.model || MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }]
  });

  try {
    const response = await Promise.race([apiPromise, timeoutPromise]);
    const rawText = (response.content && response.content[0] && response.content[0].text) || '';

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw new Error('invalid_json');
    }

    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { scoreBid, formatUserMessage };
