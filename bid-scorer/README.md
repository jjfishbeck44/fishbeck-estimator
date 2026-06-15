# bid-scorer

Prototype scoring engine for the Fishbeck Innovations bid aggregator. Takes
a bid notification (subject + body + optional spec excerpt) and returns a
structured evaluation with three scores and a recommendation.

This module is the **core differentiator** of the bid aggregator product:
"is this bid worth pursuing for a contractor whose edge is material
clearance sourcing?" Everything else (email ingestion, hosting, scheduling)
is plumbing.

## What's here

```
bid-scorer/
├── lib/
│   ├── prompt.js            System prompt for Claude (the scoring rubric)
│   ├── scoreBid.js          scoreBid(bid, opts) — calls Claude, returns JSON
│   ├── parseNotification.js Heuristic email parser (subject/agency/due/links)
│   ├── extractPdfSpec.js    Fetches + parses spec PDFs (pdf-parse pluggable)
│   ├── dedupeStore.js       File-backed dedupe (memory backend for tests)
│   ├── sources.js           Notification source adapters (fixtures/array/imap)
│   ├── senders.js           Digest sender adapters (stdout/file/resend/collect)
│   ├── digest.js            HTML + plain-text morning digest renderer
│   ├── processBatch.js      Simple parse→score→digest pipeline (no I/O)
│   ├── runDaily.js          Full orchestrator (source→dedupe→spec→score→send)
│   └── sources.json         Tier 1/2/3 source registry (data)
├── fixtures/                Synthetic bid notifications for testing
│   ├── *.txt                Structured fixtures for the scorer
│   └── emails/*.eml         Realistic email-shape fixtures for the parser
├── samples/digest.html      Rendered preview of the morning digest
├── scripts/
│   ├── score-fixture.js     Run Claude on .txt fixtures (needs API key)
│   ├── generate-sample-digest.js  Hand-written sample digest (no API key)
│   └── daily.js             End-to-end dry run: fixtures → score → file sender
└── tests/                   12 suites, 114 tests
```

## The scoring rubric

Each bid is scored on three dimensions (0–10) and gets a recommendation:

- **spec_flexibility** — how much room for clearance-sourced substitutions
- **trade_fit** — match with Fishbeck's wheelhouse (paint, LVP, unit turns)
- **bid_friendliness** — winnable for a small specialty contractor

`recommendation`:
- `"bid"` — all three scores ≥ 7
- `"skip"` — any score ≤ 3
- `"review"` — anything else (human judgement call)

See `lib/prompt.js` for the full rubric language sent to Claude.

## Running the tests

```bash
npm test -- bid-scorer
```

## Running against real Claude

Requires `ANTHROPIC_API_KEY` in env:

```bash
ANTHROPIC_API_KEY=sk-ant-... node bid-scorer/scripts/score-fixture.js mpha-unit-turn.txt
ANTHROPIC_API_KEY=sk-ant-... node bid-scorer/scripts/score-fixture.js   # all fixtures
```

## End-to-end dry run (no IMAP, no Resend)

```bash
ANTHROPIC_API_KEY=sk-ant-... node bid-scorer/scripts/daily.js
```

Reads `.eml` fixtures from `bid-scorer/fixtures/emails/`, scores each via
Claude, dedupes against `bid-scorer/.cache/seen.json`, and writes the
rendered HTML + text digest to `bid-scorer/.cache/digests/`. Running it
again should report all entries as duplicates (no Claude calls).

## What's NOT here yet (still needs desktop setup)

1. **IMAP source wiring.** `lib/sources.js` includes a stub `imapSource()`
   — install `imapflow` and wire IMAP credentials when ready to go live.
2. **Resend sender wiring.** `lib/senders.js` includes a stub
   `resendSender()` — install `resend` and set `RESEND_API_KEY`.
3. **Postgres dedupe backend.** `lib/dedupeStore.js` already abstracts
   over a backend interface; swap the JSON file backend for a Postgres
   backend when scaling beyond Fishbeck-internal use.
4. **Hosting.** Railway ($5/mo) — Vercel serverless doesn't fit because
   the IMAP poller is a long-running process.
5. **Mailing list subscriptions.** See `lib/sources.json` for the full
   Tier 1 / Tier 2 list. ~30 min total to subscribe at each.

## Tiered expansion plan (from sources.json)

- **Tier 1** — Twin Cities municipal, PHA, school district sources.
  ~6–10 subscriptions. Validates the scoring is predictive.
- **Tier 2** — Statewide PHAs (~150), school districts (~330), nonprofit
  affordable housing operators (Aeon, CommonBond, Dominium, PPL, Beacon),
  senior living chains, MnSCU, U of M, SAM.gov federal.
- **Tier 3** — Productize as SaaS for non-competing trades (HVAC,
  electrical, plumbing, roofing) or out-of-state markets. Multi-tenant
  architecture lands in Tier 2 already so this is a flip-the-switch
  upgrade.
