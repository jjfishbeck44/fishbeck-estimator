---
id: EST-0001
title: Unit Pricing — Client-Facing Cost Ranges
type: database
domain: 13_Estimating
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-06
review_cycle: quarterly
next_review: 2026-11-06
tags: [pricing, estimating, database, needs-verification]
related: [SYS-0006, SYS-0008, DEC-0007, DEC-0011]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# Unit Pricing — Client-Facing Cost Ranges

Migrated from `09_Knowledge_Base/Pricing/` in Phase 1.1. This is the
**authoritative source of pricing for the company** per `DEC-0007`.

## Files

| File | Purpose | ID prefix | Rows |
|------|---------|-----------|------|
| `Market_Rates_2024.csv` | Full rate card, 10 trade categories | `UP-####` | 40 |
| `Market_Rates_2024.md` | Narrative context and scope key | — | — |

## Schema — `Market_Rates_2024.csv`

| Column | Type | Description |
|--------|------|-------------|
| `id` | string | `UP-####`, issued Phase 1.1 |
| `legacy_id` | string | Original category ID (`SW-01`) — **crosswalk, do not remove** |
| `category` | string | Original bid-package category |
| `trade` | enum | Taxonomy trade tag per `SYS-0005` |
| `item` | string | Line item description |
| `unit` | string | `per sq ft`, `per linear foot`, `ea`, … |
| `price_low` / `price_high` | number | USD, no symbols |
| `fishbeck_scope` | enum | `in-scope` · `sub` · `out-of-scope` |
| `region` | string | `twin-cities` |
| `effective_date` | date | When this pricing takes force |
| `national_avg` | number | Published national average |
| `status` | enum | `active` · `inactive` · `deprecated` |
| `source` | string | Where the number came from |
| `confidence` | enum | Per `SYS-0003` |
| `last_updated` | date | |
| `notes` | string | |

The `legacy_id` column preserves the audit trail for anything that already cited
`SW-01`-style IDs. Never drop it.

## Confidence status — read this before quoting

**Every row is `confidence: medium`.** All 40 rows trace to a single 2024
construction bid package of *national* market rates — not Fishbeck job data and
not supplier quotes.

Per the pricing gate in `SYS-0008` (as amended by `DEC-0011`), `medium` means:
usable for internal planning and rough ranges, **not cleared to quote a client
without a stated caveat.** Reaching `confidence: high` requires three real
Fishbeck job data points or a documented supplier quote.

> **This is the single most important open item in the estimating domain.**
> Fishbeck currently has no verified pricing of its own. Every number the company
> quotes ultimately traces to national industry averages.

## Scope key

| Value | Meaning |
|-------|---------|
| `in-scope` | Fishbeck self-performs (25 rows) |
| `sub` | Delivered via subcontractor (3 rows) |
| `out-of-scope` | Excluded from estimates — electrical, plumbing, HVAC, structural, site work (12 rows) |

## Consumers

Per `DEC-0007` these are **generated consumers**, never independent sources:

| Consumer | Sync |
|----------|------|
| `lib/prompt.js` (estimator API) | Manual today → `AUT-004` |
| `public/js/calculators/pricing.js` | Manual today → `AUT-004` |

## Row versioning

Never edit a historical row's price in place. Deprecate it and add a superseding
row with a new `UP-####` and a later `effective_date` (`SYS-0007`) — this is what
keeps past estimates reproducible for accuracy scoring.

## Future automation ideas

- `AUT-004` — generate both consumer files from this CSV.
- Flag any row whose `effective_date` is older than 12 months.
- Auto-promote confidence to `high` once three `HC-#####` records corroborate a row.

## AI usage notes

Always state the confidence level when quoting these numbers. Never present a
`medium` row as a firm price. When a real job produces an actual cost, propose a
superseding row rather than editing the existing one.
