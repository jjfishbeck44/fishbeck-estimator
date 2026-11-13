---
id: QLT-0000
title: 16_Quality — Defect Prevention and the Learning Loop
type: readme
domain: 16_Quality
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [quality-control, inspection, lessons-learned, root-cause]
related: [SYS-0002, TPL-CHECKLIST, TPL-LESSONS-LEARNED, DEC-0010]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 16_Quality — Defect Prevention and the Learning Loop

## Purpose

Catch problems before the client does, and make sure each problem happens only
once. Callbacks destroy margin and referrals simultaneously — this domain exists
to make them rare.

## Scope

| In scope | Out of scope |
|----------|--------------|
| QC checklists by trade and phase | Procedures being verified → `12_Operations` |
| Defect library and root cause analyses | Code requirements → `15_Construction_Knowledge` |
| Lessons learned from every project | Punch list *records* → `14_Projects` |
| Inspection photo standards | Warranty *cost* → `21_Finance` |

## Source of truth

**Authoritative for:** what "done right" looks like, known failure modes, what
was learned.
**Defers to:** `15_Construction_Knowledge` for the underlying code standard.

Quality standards must be **measurable**. "Looks good" is not a standard; "no
gaps exceeding 1/8 inch" is.

## Structure

```
16_Quality/
├── README.md
├── QC_Checklists/      CHK-#### by trade and phase
├── Inspection_Photos/  Standards and catalogued reference images
├── Defect_Library/     DEF-#### known failure modes
├── Lessons_Learned/    LL-#### one per project minimum
└── Root_Cause/         RCA-#### for expensive or recurring failures
```

## The learning loop

```
Defect observed on a job
    ↓
Punch list item (14_Projects)
    ↓
DEF-#### if it's a pattern  ──→  new checklist item (CHK-####)
    ↓                                      ↓
3rd occurrence → RCA-####          catches it next time
    ↓
SOP revision (12_Operations)  ──→  prevents it entirely
```

Prevention beats detection; detection beats the client finding it. Every defect
should move leftward in this chain over time.

## When to use which artifact

| Situation | Artifact |
|-----------|----------|
| Anything learned on a project | `LL-####` — required at every closeout |
| A failure mode seen more than once | `DEF-####` |
| Failure costing >$500, recurring 3×, safety incident, or client damage | `RCA-####` |
| A verification that should happen every time | `CHK-####` item |

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| QC checklists | `CHK-####` | ⬜ | 5.3 |
| Defect library | `DEF-####` | ⬜ | 5.4 |
| Lessons learned | `LL-####` | ◐ legacy `Post_Mortems.md` migrating | 1.1 / 5.5 |
| Root cause analyses | `RCA-####` | ⬜ | 5.5 |

## Planned checklists

| Checkpoint | Why it's a hold point |
|------------|----------------------|
| Pre-drywall / pre-cover | Last chance to see rough-in before it's hidden |
| Paint acceptance | Highest source of cosmetic callbacks |
| Flooring acceptance | Damage after install is unattributable |
| Rental turn completion | Highest-volume service; must be consistent |
| Substantial completion | Drives the punch list |
| Final walkthrough | Client-facing; sets the tone for referrals |

## Photo standards

Per `SYS-0004`: `PRJ-####_YYYY-MM-DD_<area>_<stage>_###.jpg`

| Stage | When required |
|-------|---------------|
| `before` | **Always**, before any work — protects against pre-existing damage claims |
| `progress` | At each hold point, especially before anything is covered |
| `after` | **Always**, at completion |
| `defect` | Every failed checklist item |
| `inspection` | At each inspection |

Before-photos are the cheapest liability protection in construction. There is no
project small enough to skip them.

## Relationships

| Domain | Relationship |
|--------|-------------|
| `14_Projects` | Supplies punch lists, defects, photos, and closeout lessons |
| `12_Operations` | Receives SOP revisions driven by lessons learned |
| `15_Construction_Knowledge` | Supplies the standards checklists verify against |
| `22_Analytics` | Computes `KPI-007` callback rate and `KPI-008` punch items |
| `17_Purchasing` | Receives material- and sub-caused defect data |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1.1 | Absorb legacy `Post_Mortems.md` as `LL-####` seed | ⬜ |
| 5.3 | QC checklists by trade | ⬜ |
| 5.4 | Defect library seeded from real callbacks | ⬜ |
| 5.5 | Lessons learned + RCA in routine use | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | What callbacks have actually occurred historically? | Seeding the defect library with real data instead of generic ones |

## Future automation ideas

- Auto-create a punch list item from any failed checklist row.
- Auto-trigger an RCA at a defect's third occurrence.
- Track corrective-action closure rate — unclosed loops are the usual failure.
- Pareto chart of defects by trade to target the highest-leverage fix.
- Photo completeness check: no project closes without before and after sets.

## AI usage notes

Before estimating or scoping, search lessons learned and the defect library by
`trade` and `project-type` — this is how the company stops repeating mistakes.
Never accept "human error" as a root cause; ask what system allowed it. Seed the
defect library only from **real** Fishbeck callbacks, never from generic industry
lists, or the data becomes noise.
