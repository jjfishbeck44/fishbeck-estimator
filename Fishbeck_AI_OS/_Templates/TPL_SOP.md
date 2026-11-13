---
id: TPL-SOP
title: Template — Standard Operating Procedure
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, sop, operations, standard]
related: [SYS-0003, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Standard Operating Procedure

Copy everything below the line into `12_Operations/SOP_Library/SOP-####_<Short-Title>.md`.

An SOP is written so that **someone who has never done the task can complete it
correctly without asking a question.** If a step requires judgment, the SOP must
say what to weigh and who to escalate to.

---

```yaml
---
id: SOP-####
title: <Verb-first name, e.g. "Turn a Rental Unit">
type: sop
domain: 12_Operations
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: semiannual
next_review: YYYY-MM-DD
tags: [<trade>, operations, <project-type>]
related: [CHK-####, SOP-####]
source_of_truth: true
ai_usage: read-write
confidence: medium
trade: <trade or omit>
---
```

# SOP-#### — <Title>

## Purpose

One sentence: what this procedure produces and why it matters.

## Scope

**Applies to:** <which jobs, trades, or situations>
**Does not apply to:** <explicit exclusions — prevents misuse>

## Roles

| Role | Responsibility |
|------|----------------|
| Performer | Who executes |
| Reviewer | Who verifies |
| Approver | Who signs off (if applicable) |

## Prerequisites

- [ ] Materials on site (list, with `MAT-####` references)
- [ ] Tools required (list, with `EQP-####` references)
- [ ] Permits pulled (cite `15_Construction_Knowledge/Permitting_Matrix.md`)
- [ ] Access confirmed (keys, lockbox, tenant notice)
- [ ] Safety equipment present

## Procedure

### Phase 1 — <Name>

1. **<Action verb> <object>.**
   - Detail, tolerance, or spec.
   - Code reference if applicable: `CODE-####`.
   - **Stop condition:** what makes you halt and escalate.
2. **<Next step>.**

### Phase 2 — <Name>

3. …

> Steps are numbered continuously across phases so they can be cited precisely
> ("failed at step 7").

## Quality checkpoints

| Checkpoint | Standard | Verified by | Evidence |
|------------|----------|-------------|----------|
| After phase 1 | <measurable standard> | Performer | Photo `<stage: progress>` |
| Before closeout | <measurable standard> | Reviewer | Checklist `CHK-####` |

Standards must be **measurable**. "Looks good" is not a standard; "no gaps
exceeding 1/8 inch" is.

## Common failure modes

| What goes wrong | Why | Prevention | Related |
|-----------------|-----|------------|---------|
| <observed failure> | <root cause> | <the step that prevents it> | `DEF-####` |

Seed this table from `16_Quality/Defect_Library` — it is how lessons learned
become permanent.

## Time and cost baseline

| Item | Value | Source |
|------|-------|--------|
| Typical duration | <hours or days> | `PRD-####` |
| Crew size | <n> | `PRD-####` |
| Typical material cost | <$> | `MAT-####` |

Never hard-code a number here that lives in the estimating database — cite the
ID so there is one source of truth.

## Escalation

| Situation | Escalate to | Timeframe |
|-----------|-------------|-----------|
| Hidden damage discovered | Jimmy | Immediately, before proceeding |
| Scope change requested by client | Jimmy | Same day; no verbal approvals |
| Code question | Jimmy → inspector | Before covering work |

## Related documents

- Checklist: `CHK-####`
- Codes: `CODE-####`
- Upstream SOP: `SOP-####`
- Downstream SOP: `SOP-####`

## Future automation ideas

- <What could be templated, scheduled, or auto-captured>

## AI usage notes

- <How an AI should use this — e.g. "when scoping a rental turn, use this
  sequence to build the line items">

## Revision history

| Version | Date | Change | By |
|---------|------|--------|-----|
| 0.1.0 | YYYY-MM-DD | Initial draft | |
