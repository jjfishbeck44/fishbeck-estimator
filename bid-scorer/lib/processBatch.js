// bid-scorer/lib/processBatch.js
// Pipeline orchestrator: raw notification text -> parsed bid -> scored bid -> digest.
//
// Designed to be called by the daily cron after IMAP fetches new notifications.
// Each step is isolated so failures on one notification don't kill the batch.

const { parseNotification } = require('./parseNotification');
const { scoreBid } = require('./scoreBid');
const { renderDigest } = require('./digest');

async function processOne(rawNotification, opts) {
  try {
    const bid = parseNotification(rawNotification);
    const score = await scoreBid(bid, opts);
    return { ok: true, bid, score };
  } catch (err) {
    return {
      ok: false,
      error: err.message,
      rawPreview: typeof rawNotification === 'string'
        ? rawNotification.slice(0, 200)
        : null
    };
  }
}

async function processBatch(rawNotifications, opts) {
  opts = opts || {};
  const results = [];
  for (const raw of rawNotifications) {
    results.push(await processOne(raw, opts));
  }

  const scored = results.filter((r) => r.ok).map((r) => r.score);
  const failed = results.filter((r) => !r.ok);
  const digest = renderDigest(scored, { date: opts.date });

  return {
    scored,
    failed,
    digest,
    summary: {
      attempted: results.length,
      succeeded: scored.length,
      failed: failed.length,
      ...digest.counts
    }
  };
}

module.exports = { processBatch, processOne };
