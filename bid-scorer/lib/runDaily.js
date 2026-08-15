// bid-scorer/lib/runDaily.js
// The daily pipeline. Source -> parse -> dedupe -> spec-enrich -> score -> digest -> send.
//
// All collaborators are injected so the orchestrator is fully testable in
// memory. cron/daily.js wires real implementations (IMAP source, Resend
// sender, Postgres-backed dedupe store) — runDaily itself never knows or
// cares which.

const { parseNotification } = require('./parseNotification');
const { scoreBid } = require('./scoreBid');
const { enrichBidWithSpec } = require('./extractPdfSpec');
const { renderDigest } = require('./digest');

async function runDaily(opts) {
  if (!opts || !opts.source) throw new Error('missing_source');
  if (!opts.sender) throw new Error('missing_sender');
  if (!opts.store) throw new Error('missing_store');

  const {
    source,
    sender,
    store,
    client,
    fetchPdf,
    parsePdf,
    date = new Date().toISOString().slice(0, 10),
    enrichSpecs = true,
    onEvent = () => {}
  } = opts;

  const raws = await source.fetchNew();
  onEvent({ type: 'fetched', count: raws.length, source: source.name });

  const scored = [];
  const skippedDuplicate = [];
  const failed = [];

  for (const raw of raws) {
    try {
      const bid = parseNotification(raw);

      if (await store.has(bid)) {
        skippedDuplicate.push({ subject: bid.subject, agency: bid.agency });
        onEvent({ type: 'skipped_duplicate', subject: bid.subject });
        continue;
      }

      const enriched = enrichSpecs
        ? await enrichBidWithSpec(bid, { fetch: fetchPdf, parse: parsePdf })
        : bid;

      const score = await scoreBid(enriched, { client });
      scored.push(score);
      await store.mark(bid, { recommendation: score.recommendation });
      onEvent({ type: 'scored', subject: bid.subject, recommendation: score.recommendation });
    } catch (err) {
      failed.push({ error: err.message, preview: typeof raw === 'string' ? raw.slice(0, 200) : null });
      onEvent({ type: 'failed', error: err.message });
    }
  }

  const digest = renderDigest(scored, { date });
  const delivery = await sender.send(digest, { date });
  onEvent({ type: 'sent', channel: sender.name, ...delivery });

  return {
    summary: {
      fetched: raws.length,
      scored: scored.length,
      duplicates: skippedDuplicate.length,
      failed: failed.length,
      ...digest.counts
    },
    scored,
    skippedDuplicate,
    failed,
    digest,
    delivery
  };
}

module.exports = { runDaily };
