---
id: TPL-ESTIMATE
title: Template — Estimate
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, estimating, pricing, sales]
related: [TPL-PROJECT-CHARTER, SYS-0006]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Estimate

Copy below the line into `13_Estimating/Estimates/EST-####_<YYYY-MM-DD>_<Client>.md`.

**Every line must cite the database row it came from.** An estimate with
uncited numbers cannot be scored for accuracy later, which means it teaches the
company nothing.

---

```yaml
---
id: EST-####
title: Estimate — <address or project>
type: record
domain: 13_Estimating
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [estimating, <project-type>, <client-type>]
related: [LED-####, CLI-####, PRJ-####]
source_of_truth: true
ai_usage: read-write
confidence: high
client_id: CLI-####
effective_date: YYYY-MM-DD
---
```

# EST-#### — <Project>

| Field | Value |
|-------|-------|
| Client | `CLI-####` / `LED-####` |
| Address | |
| Date | YYYY-MM-DD |
| Valid until | YYYY-MM-DD (30 days standard) |
| Prepared by | Jimmy Fishbeck |
| Project type | |
| Basis | walkthrough / photos / plans / description only |

**Basis matters.** An estimate from a description carries far more risk than one
from a walkthrough. State it, and set contingency accordingly.

## Line items

| # | Scope | Qty | Unit | Unit cost | Total | Source ID | Confidence |
|---|-------|-----|------|-----------|-------|-----------|------------|
| 1 | | | sf | | | `ASM-####` | high |
| 2 | | | lf | | | `UP-####` | medium |

Prefer `ASM-####` assemblies over raw unit prices — assemblies already bundle
material, labor, and waste, and they stay consistent across estimates.

## Cost summary

| Category | Amount |
|----------|--------|
| Labor | $ |
| Materials | $ |
| Subcontractors | $ |
| Equipment / rental | $ |
| Permits / fees | $ |
| **Subtotal direct cost** | **$** |
| Overhead (<%>) | $ |
| Profit (<%>) | $ |
| Contingency (<%>) | $ |
| **Total** | **$** |

Present to clients as a range (low–high) per the estimator's existing
convention, with the range width reflecting the basis and contingency.

## Assumptions

- <Every assumption that, if wrong, changes the price.>

## Exclusions

- <What is explicitly not included.>

Exclusions are the cheapest insurance in construction. Be exhaustive.

## Allowances

| Item | Allowance | Basis |
|------|-----------|-------|
| <e.g. tile selection> | $ | per sf |

## Conditions

- Price valid <n> days from the date above.
- Payment schedule: <terms>
- Change orders required for scope changes, signed before work proceeds.
- Access and utilities provided by owner.

## Risk factors

| Risk | Likelihood | Cost exposure | Covered by |
|------|-----------|---------------|------------|
| Hidden damage behind finishes | | $ | contingency / exclusion |

## Accuracy tracking

Filled at project closeout — this is what makes `KPI-001` possible.

| Field | Value |
|-------|-------|
| Became project | `PRJ-####` |
| Estimated total | $ |
| Actual total | $ |
| Variance | % |
| Historical cost record | `HC-#####` |
| Primary variance driver | labor / material / scope / schedule |

## Future automation ideas

- Generate the estimate from assemblies given a takeoff quantity list.
- Auto-populate accuracy tracking from `21_Finance` at closeout.
- Flag line items whose source row is older than 90 days (stale pricing).
- Variance analysis by trade to find systematically mis-priced work.

## AI usage notes

Never produce a line item without a source ID. If no database row exists for a
scope, say so and mark the line `confidence: unverified` — do not invent a
number. Check `16_Quality/Lessons_Learned` for this project type before
finalizing.
