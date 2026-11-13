---
id: TPL-CHECKLIST
title: Template — Checklist
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, checklist, quality-control]
related: [TPL-SOP, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Checklist

Copy below the line into `16_Quality/QC_Checklists/CHK-####_<Short-Title>.md` or
`12_Operations/Checklists/`.

**A checklist is not an SOP.** The SOP teaches how; the checklist verifies that
it happened. Checklist items are binary and observable — no judgment calls.

---

```yaml
---
id: CHK-####
title: <What is being verified>
type: checklist
domain: 16_Quality
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: semiannual
next_review: YYYY-MM-DD
tags: [<trade>, quality-control, checklist]
related: [SOP-####, DEF-####]
source_of_truth: true
ai_usage: read-write
confidence: medium
trade: <trade>
---
```

# CHK-#### — <Title>

## Use when

<Trigger: e.g. "Before drywall is covered", "At substantial completion">

## Verified by

<Role> · **Evidence required:** photo / measurement / signature

## Header

| Field | Value |
|-------|-------|
| Project | `PRJ-####` |
| Date | YYYY-MM-DD |
| Inspector | |
| Result | pass / fail / conditional |

## Items

### <Section, e.g. Rough-in>

| # | Item | Standard | Pass | Evidence | Code ref |
|---|------|----------|------|----------|----------|
| 1 | <observable condition> | <measurable threshold> | ☐ | photo | `CODE-####` |
| 2 | | | ☐ | | |

### <Next section>

| # | Item | Standard | Pass | Evidence | Code ref |
|---|------|----------|------|----------|----------|
| 3 | | | ☐ | | |

## Fail handling

Any failed item requires:

1. A photo tagged `defect` (naming per `SYS-0004`).
2. A `DEF-####` entry if the failure is a **repeat pattern** across jobs.
3. Re-inspection after correction; the original fail row stays in the record.

Never overwrite a fail with a pass. The failure history is what drives the
defect library.

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Inspector | | | |
| Approver | | | |

## Future automation ideas

- Mobile form that emits this markdown and auto-names photos.
- Auto-create a punch list item for every failed row.
- Track pass rate per item to find the steps that fail most often.

## AI usage notes

When a checklist item fails repeatedly across projects, propose a `DEF-####`
entry and an SOP amendment — recurring failures are a process defect, not a
worker defect.
