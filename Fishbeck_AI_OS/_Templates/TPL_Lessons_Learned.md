---
id: TPL-LESSONS-LEARNED
title: Template — Lessons Learned
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, lessons-learned, quality-control, closeout]
related: [TPL-ROOT-CAUSE, TPL-PROJECT-CHARTER]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Lessons Learned

Copy below the line into `16_Quality/Lessons_Learned/LL-####_<Short-Title>.md`.

Required at every project closeout (`DEC-0010`). A lesson that doesn't change a
document changes nothing — every lesson must name the file it modifies.

---

```yaml
---
id: LL-####
title: <What was learned, stated as a finding>
type: record
domain: 16_Quality
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [lessons-learned, <trade>, <project-type>]
related: [PRJ-####, SOP-####, DEF-####]
source_of_truth: true
ai_usage: read-write
confidence: high
project_id: PRJ-####
---
```

# LL-#### — <Finding>

## Context

| Field | Value |
|-------|-------|
| Project | `PRJ-####` — <address> |
| Trade | |
| Date identified | YYYY-MM-DD |
| Category | estimating / scheduling / quality / procurement / client / safety / code |
| Cost impact | $<amount or "none"> |
| Schedule impact | <days or "none"> |

## What happened

<Factual account. No blame — the point is the system, not the person.>

## What we expected

<The assumption that turned out to be wrong. Name it explicitly — the gap
between expected and actual is the lesson.>

## Why it happened

<Root cause. If it's complex or recurring, do a full `RCA-####` instead and
link it here.>

## What we're changing

**A lesson with no document change is not a lesson.** Every row must name a file.

| Change | Document to update | Owner | Status |
|--------|--------------------|-------|--------|
| <specific change> | `SOP-####` / `CHK-####` / `UP-####` / `PRD-####` | | ☐ |

## Reusability

- [ ] Applies to all projects of this type
- [ ] Applies to this trade only
- [ ] Applies to this client or property only
- [ ] One-off — no systemic change needed

If one-off, say why — it prevents someone re-litigating it later.

## Related

- Defect library: `DEF-####`
- Root cause: `RCA-####`
- Similar past lesson: `LL-####`

## Future automation ideas

- Prompt for lessons learned automatically at closeout.
- Cluster lessons by category to reveal the top three systemic weaknesses.
- Track whether the named document actually got updated — an unclosed loop is
  the most common failure of lessons-learned systems.

## AI usage notes

Before estimating or scoping a project, search lessons learned by `trade` and
`project-type` tags and surface anything relevant. This is the mechanism by
which the company stops repeating mistakes.
