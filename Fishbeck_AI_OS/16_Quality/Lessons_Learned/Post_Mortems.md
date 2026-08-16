---
id: LL-0001
title: Post-Mortems — Legacy Log
type: record
domain: 16_Quality
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-06
review_cycle: quarterly
next_review: 2026-11-06
tags: [lessons-learned, quality-control, estimating]
related: [QLT-0000, TPL-LESSONS-LEARNED, EST-0001]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

> **Migration note (Phase 1.1).** Moved from `09_Knowledge_Base/Post_Mortems.md`.
> This is the legacy free-form log. Going forward each lesson becomes its own
> `LL-####` record via `_Templates/TPL_LESSONS_LEARNED.md`, which forces every
> lesson to name the document it changes. This file is retained as the seed and
> as the historical record.

# Post-Mortems

A running log of what actually happened on jobs versus what was planned. This is how
the Knowledge Base stays honest: field variances feed back into pricing, production
rates, and estimates so future bids get more accurate.

## How to use
- Add an entry after each notable job (or when a variance is worth recording).
- When a variance reveals that pricing or rates are off, **update the relevant
  `13_Estimating` CSV** and note the change here.
- Keep entries factual and specific.

## Entry template
```
### [Project ref / address] — [date]
- **Service / scope:**
- **Estimated:** cost / timeline
- **Actual:** cost / timeline
- **Variance:** $ and %, days
- **Cause of variance:** (scope creep, conditions, materials, labor, weather, permit delay)
- **Budget update:** what changed
- **Schedule delay:** cause and length
- **KB update made:** (which CSV/file row, or "none")
- **Lesson learned / action:**
```

## Log

### [Example ref] FI-EXAMPLE — 2026-06-21
- **Service / scope:** Standard rental turn, 2BR
- **Estimated:** $2,800 / 4 days
- **Actual:** $3,400 / 6 days
- **Variance:** +$600 (+21%), +2 days
- **Cause of variance:** Hidden water damage behind vanity; subfloor repair
- **Budget update:** Added subfloor contingency to turn estimates
- **Schedule delay:** 2 days waiting on subfloor dry-out
- **KB update made:** Note added to `13_Estimating/Unit_Pricing/` rental-turn contingency guidance
- **Lesson learned / action:** Inspect under vanities during assessment

> Review quarterly. Patterns here should drive updates to `13_Estimating/_Data/` and `13_Estimating/Unit_Pricing/`.
