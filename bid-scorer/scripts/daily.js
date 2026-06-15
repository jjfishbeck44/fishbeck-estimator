#!/usr/bin/env node
// bid-scorer/scripts/daily.js
// Production-ish entry point for the daily cron. Today it uses the fixtures
// source + file sender so you can dry-run the whole pipeline locally with
// just ANTHROPIC_API_KEY set. Swap to imapSource + resendSender when going
// live.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node bid-scorer/scripts/daily.js
//
// Output:
//   bid-scorer/.cache/seen.json     dedupe state
//   bid-scorer/.cache/digests/      rendered HTML + text digests

const path = require('path');

const { runDaily } = require('../lib/runDaily');
const { fixturesSource } = require('../lib/sources');
const { fileSender } = require('../lib/senders');
const { createDedupeStore } = require('../lib/dedupeStore');

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY required');
    process.exit(1);
  }

  const root = path.join(__dirname, '..');
  const source = fixturesSource(path.join(root, 'fixtures', 'emails'));
  const sender = fileSender(path.join(root, '.cache', 'digests'));
  const store = createDedupeStore({
    tenantId: 'fishbeck',
    filePath: path.join(root, '.cache', 'seen.json')
  });

  const result = await runDaily({
    source,
    sender,
    store,
    onEvent: (e) => console.log(JSON.stringify(e))
  });

  console.log('');
  console.log('Summary:', result.summary);
  console.log('Digest written to:', result.delivery.htmlPath);
}

main().catch((err) => {
  console.error('FATAL:', err.stack || err.message);
  process.exit(1);
});
