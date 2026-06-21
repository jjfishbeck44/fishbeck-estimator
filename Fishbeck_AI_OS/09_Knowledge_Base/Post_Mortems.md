# Post-Mortems

A running log of what actually happened on jobs versus what was planned. This is how
the Knowledge Base stays honest: field variances feed back into pricing, production
rates, and estimates so future bids get more accurate.

## How to use
- Add an entry after each notable job (or when a variance is worth recording).
- When a variance reveals that pricing or rates are off, **update the relevant
  `Data_Formats` CSV** and note the change here.
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
- **KB update made:** Note added to `Pricing/` rental-turn contingency guidance
- **Lesson learned / action:** Inspect under vanities during assessment

> Review quarterly. Patterns here should drive updates to `Data_Formats/` and `Pricing/`.
