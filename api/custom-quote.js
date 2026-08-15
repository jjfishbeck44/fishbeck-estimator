// api/custom-quote.js
// POST /api/custom-quote  { name, email, phone?, projectType?, description, fileNote? }
// Emails the request to Fishbeck via Resend. No file storage — the customer
// attaches files in their reply (the email's reply-to is set to the customer).

const { checkRateLimit } = require('../lib/ratelimit');
const { sendEmail } = require('../lib/email');

const TO = 'jimmy@fishbeckinnovations.com';
const MAX_DESC = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Too many requests. Please try again in a minute.' });
  }

  const b = req.body || {};
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';
  const phone = typeof b.phone === 'string' ? b.phone.trim() : '';
  const projectType = typeof b.projectType === 'string' ? b.projectType.trim() : '';
  const description = typeof b.description === 'string' ? b.description.trim() : '';
  const fileNote = typeof b.fileNote === 'string' ? b.fileNote.trim() : '';

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'missing_fields', message: 'Please include your name, email, and a project description.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'invalid_email', message: 'Please enter a valid email address.' });
  }
  if (description.length > MAX_DESC) {
    return res.status(400).json({ error: 'description_too_long', message: 'Please keep the description under 2,000 characters.' });
  }

  const lines = [
    'NEW CUSTOM QUOTE REQUEST',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    projectType ? `Project type: ${projectType}` : null,
    '',
    'Description:',
    description,
    '',
    fileNote ? `Files: ${fileNote}` : 'Files: customer will attach to their reply.',
    '',
    'Reply to this email to reach the customer directly.'
  ].filter(Boolean);

  try {
    await sendEmail({
      to: TO,
      replyTo: email,
      subject: `Custom quote request — ${name}`,
      text: lines.join('\n')
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.message === 'email_not_configured') {
      return res.status(503).json({ error: 'email_not_configured', message: 'Email isn’t set up yet. Please email us directly.' });
    }
    return res.status(502).json({ error: 'email_failed', message: 'We couldn’t send your request. Please email us directly.' });
  }
};
