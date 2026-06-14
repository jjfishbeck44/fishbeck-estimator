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
│   ├── prompt.js        System prompt for Claude (the scoring rubric)
│   ├── scoreBid.js      scoreBid(bid, opts) — calls Claude, returns JSON
│   └── sources.json     Registry of Tier 1 / Tier 2 / Tier 3 source plans
├── fixtures/            Synthetic bid notifications for testing
│   ├── mpha-unit-turn.txt        — should score "bid" (high spec flex)
│   ├── mndot-rigid-spec.txt      — should score "skip" (hard SKU lockdown)
│   ├── school-summer-paint.txt   — should score "bid" (flexible specs)
│   └── county-hvac-mixed.txt     — should score "review" or "skip"
├── scripts/
│   └── score-fixture.js Runs Claude on fixtures and prints results
└── tests/
    └── scoreBid.test.js Unit tests with mocked Anthropic SDK
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

## What's NOT here yet (next steps when at a desktop)

1. **Email ingestion.** An IMAP poller that reads a dedicated inbox
   (e.g. `bids@fishbeckinnovations.com`), pulls new notification messages,
   downloads attached/linked spec PDFs, and feeds them through `scoreBid`.
2. **PDF text extraction.** `pdf-parse` to convert linked spec PDFs into
   the `specText` field.
3. **Persistence.** Postgres (Neon free tier) to store scored bids and
   avoid re-scoring the same one twice. Every record carries `tenant_id`
   from day one so Tier 3 SaaS is a flip-the-switch upgrade.
4. **Digest email.** Resend or Postmark sends a 7am summary of the day's
   "bid" and "review" verdicts.
5. **Hosting.** Railway ($5/mo) — Vercel serverless doesn't fit because
   the IMAP poller is a long-running process.
6. **Mailing list subscriptions.** See `lib/sources.json` for the full
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
