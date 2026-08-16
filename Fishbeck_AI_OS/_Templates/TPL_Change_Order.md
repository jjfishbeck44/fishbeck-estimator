---
id: TPL-CHANGE-ORDER
title: Template — Change Order
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, change-order, project-management, legal]
related: [TPL-PROJECT-CHARTER, SYS-0004]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Change Order

Copy below the line into
`14_Projects/PRJ-####_.../05_Change_Orders/PRJ-####_CO-##_<Short-Title>.md`.

**No work proceeds on a change until this is signed.** Verbal approvals are the
single most common way small contractors lose money.

---

```yaml
---
id: CO-##
title: <Short description>
type: record
domain: 14_Projects
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [change-order, <trade>, <project-type>]
related: [PRJ-####, EST-####]
source_of_truth: true
ai_usage: read-write
confidence: high
project_id: PRJ-####
client_id: CLI-####
cost_impact: <signed dollar amount>
---
```

# CO-## — <Title>

| Field | Value |
|-------|-------|
| Project | `PRJ-####` — <address> |
| Change order # | CO-## |
| Date issued | YYYY-MM-DD |
| Requested by | client / contractor / inspector / field condition |
| Status | pending / approved / rejected / void |

## Reason for change

Pick one and explain:

- [ ] Client-requested scope addition
- [ ] Hidden/unforeseen condition discovered
- [ ] Code or inspector requirement
- [ ] Design change
- [ ] Material substitution (availability or lead time)
- [ ] Estimating omission — **our error**

> Mark our own errors honestly. `KPI-006` change order rate is meaningless if
> omissions get recorded as client requests, and the estimating database never
> learns.

## Description of change

<Plain language a client can understand. State what was in the original scope,
what is changing, and why.>

## Cost impact

| Item | Qty | Unit | Unit cost | Total | Source |
|------|-----|------|-----------|-------|--------|
| Labor | | hr | | | `LAB-####` |
| Materials | | | | | `MAT-####` |
| Subcontractor | | | | | `SUB-####` |
| Overhead & profit | | % | | | |
| **Total change** | | | | **$** | |

| | Amount |
|---|--------|
| Original contract | $ |
| Previous change orders | $ |
| This change order | $ |
| **New contract total** | **$** |

## Schedule impact

| | Days |
|---|------|
| Original completion | YYYY-MM-DD |
| Days added | |
| **Revised completion** | **YYYY-MM-DD** |

State schedule impact even when it's zero — silence gets read as "no delay."

## Supporting documentation

- Photos: `PRJ-####_YYYY-MM-DD_<area>_<stage>_###.jpg`
- Inspector correction notice: <reference>
- Supplier quote: <reference>

## Approval

Work on this change does not begin until signed.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Contractor | Jimmy Fishbeck | | |
| Client | | | |

## Future automation ideas

- Generate the change order from a photo + voice note on site.
- Auto-update the project charter's contract total and CO table on approval.
- E-signature integration so approval happens same-day.

## AI usage notes

Price change orders from the estimating database (`MAT`/`LAB`/`ASM` IDs), never
from memory. Flag when a project's cumulative change orders exceed the `KPI-006`
threshold of 10% — that signals a scoping problem worth fixing upstream.
