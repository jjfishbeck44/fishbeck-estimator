---
id: TPL-ROOT-CAUSE
title: Template — Root Cause Analysis
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, root-cause, quality-control]
related: [TPL-LESSONS-LEARNED]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Root Cause Analysis

Copy below the line into `16_Quality/Root_Cause/RCA-####_<Short-Title>.md`.

**Use an RCA when:** the failure cost more than $500, recurred a third time,
caused a safety incident, or damaged a client relationship. Otherwise a
lessons-learned record is enough.

---

```yaml
---
id: RCA-####
title: <Failure being analyzed>
type: analysis
domain: 16_Quality
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [root-cause, quality-control, <trade>]
related: [PRJ-####, LL-####, DEF-####]
source_of_truth: true
ai_usage: read-write
confidence: high
project_id: PRJ-####
cost_impact: <dollar amount>
---
```

# RCA-#### — <Title>

## Problem statement

<One sentence: what failed, where, when, and what it cost.>

| Field | Value |
|-------|-------|
| Detected | YYYY-MM-DD |
| Detected by | client / inspector / crew / QC checklist |
| Direct cost | $ |
| Indirect cost | <schedule, reputation, rework> |
| Recurrence | first time / <n>th occurrence |

## Timeline

| When | What happened |
|------|---------------|
| YYYY-MM-DD | |

## Five whys

1. **Why did <the problem> happen?** →
2. **Why?** →
3. **Why?** →
4. **Why?** →
5. **Why?** →

**Root cause:** <the last answer — it should be a process, standard, or system,
never a person>

If the fifth why lands on "someone was careless," go deeper. The real question
is why the system allowed carelessness to reach the client.

## Contributing factors

| Category | Factor |
|----------|--------|
| Process | <missing or wrong step> |
| People | <training or capacity gap> |
| Materials | <spec, quality, substitution> |
| Environment | <weather, site conditions> |
| Measurement | <what should have caught it and didn't> |

## Corrective actions

Fix the instance:

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | ☐ |

## Preventive actions

Fix the system so it cannot recur:

| Action | Document to change | Owner | Due | Status |
|--------|--------------------|-------|-----|--------|
| | `SOP-####` / `CHK-####` | | | ☐ |

## Detection improvement

**What would have caught this earlier?**

| Control | Where it goes | Added |
|---------|---------------|-------|
| <new checklist item, hold point, inspection> | `CHK-####` | ☐ |

Most failures are detection failures. Adding the control is usually more
valuable than the corrective action.

## Verification

| Check | Date | Result |
|-------|------|--------|
| Preventive action implemented | | |
| No recurrence after <n> similar jobs | | |

## Related

- Lessons learned: `LL-####`
- Defect entry: `DEF-####`
- Prior occurrences: `RCA-####`

## Future automation ideas

- Auto-trigger an RCA when a `DEF-####` hits its third occurrence.
- Track corrective-action closure rate as a quality KPI.
- Cluster root causes to find the highest-leverage systemic fix.

## AI usage notes

Never accept "human error" as a root cause — ask what system permitted it.
When a defect recurs a third time, propose an RCA proactively.
