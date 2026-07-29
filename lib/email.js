// lib/email.js
// Thin Resend wrapper (REST API, no SDK dependency). Sends transactional email.
// Requires RESEND_API_KEY. Optional RESEND_FROM (defaults to Resend's onboarding
// sender so it works before a custom domain is verified). Throws typed errors.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Fishbeck Innovations <onboarding@resend.dev>';

function isConfigured() {
  return !!process.env.RESEND_API_KEY;
}

// opts: { to, subject, text, replyTo }
async function sendEmail(opts) {
  if (!isConfigured()) throw new Error('email_not_configured');

  const payload = {
    from: process.env.RESEND_FROM || DEFAULT_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    text: opts.text
  };
  if (opts.replyTo) payload.reply_to = opts.replyTo;

  let resp;
  try {
    resp = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('email_failed');
  }
  if (!resp.ok) throw new Error('email_failed');

  try { return await resp.json(); } catch { return {}; }
}

module.exports = { isConfigured, sendEmail, DEFAULT_FROM };
