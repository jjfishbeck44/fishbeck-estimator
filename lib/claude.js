// lib/claude.js
// Wraps the Anthropic SDK. Takes user input + system prompt, returns parsed JSON.
// Enforces a 25-second timeout to stay within Vercel's 30s function limit.

const Anthropic = require('@anthropic-ai/sdk');

const TIMEOUT_MS = 25000;

async function callClaude(userInput, systemPrompt) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('api_timeout')), TIMEOUT_MS)
  );

  const apiPromise = client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userInput }]
  });

  const response = await Promise.race([apiPromise, timeoutPromise]);
  const rawText = response.content[0]?.text ?? '';

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('invalid_json');
  }

  return parsed;
}

module.exports = { callClaude };
