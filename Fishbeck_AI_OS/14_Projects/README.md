---
id: PRJ-0000
title: 14_Projects — The Job Record of Truth
type: readme
domain: 14_Projects
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: monthly
next_review: 2026-08-31
tags: [project-management, operations, database]
related: [SYS-0002, TPL-PROJECT-CHARTER, DEC-0010]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 14_Projects — The Job Record of Truth

## Purpose

Every job Fishbeck has ever done, with everything that happened on it. Projects
are where the company's data is actually *generated* — every other domain either
feeds a project or learns from one.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Project charters, daily reports, photos | Cost databases → `13_Estimating` |
| Change orders, RFIs, submittals, punch lists | Invoices and payments → `21_Finance` |
| Closeout packages | Client relationship history → `20_CRM` |
| Job-specific correspondence and decisions | Procedures → `12_Operations` |
| | Marketing write-ups → `04_Case_Studies` |

## Source of truth

**Authoritative for:** what happened on a job, when, who did it, what changed.
**Defers to:** `21_Finance` for what was actually paid, `13_Estimating` for what
things should cost, `20_CRM` for who the client is.

## Structure

```
14_Projects/
├── README.md
├── Active/
│   └── PRJ-####_YYYY_City_Address/
│       ├── 00_Project_Charter.md
│       ├── 01_Estimate/
│       ├── 02_Contracts/
│       ├── 03_Daily_Reports/
│       ├── 04_Photos/
│       ├── 05_Change_Orders/
│       ├── 06_RFIs_Submittals/
│       ├── 07_Invoices/
│       ├── 08_Punch_List/
│       └── 09_Closeout/
└── Completed/
    └── (same structure, moved at archive)
```

**The subfolder structure is fixed.** Identical on every project so anyone —
human or AI — can navigate any job without exploring.

## Lifecycle

```
preconstruction → active → punch-list → closeout → warranty-period → archived
```

A project moves from `Active/` to `Completed/` only at `archived`.

## The closeout gate

Per `DEC-0010`, a project **cannot** reach `archived` until all five exist:

| # | Artifact | Destination | Why |
|---|----------|-------------|-----|
| 1 | Historical cost rows | `13_Estimating/Historical_Costs/` | Estimates get more accurate |
| 2 | Lessons learned | `16_Quality/Lessons_Learned/` | Mistakes stop repeating |
| 3 | New defect patterns | `16_Quality/Defect_Library/` | Prevention becomes systematic |
| 4 | Vendor/sub performance | `17_Purchasing/` | Buying decisions improve |
| 5 | Photos catalogued + case study assessed | `04_Case_Studies/` | Work becomes marketing |

**This is the single most important rule in the operating system.** A project
that closes without these was a job. A project that closes with them made the
company permanently better.

## Naming

Per `SYS-0004`:

```
PRJ-0007_2026_Saint-Paul_1234-Main-St/
PRJ-0007_Daily_2026-07-31.md
PRJ-0007_CO-01_Subfloor-Replacement.md
PRJ-0007_2026-07-31_kitchen_before_001.jpg
```

CO / RFI / submittal / punch numbers restart at 01 per project.

## Required fields

Every artifact inside a project folder carries `project_id: PRJ-####` in its
front matter. This is the join that makes cross-project analysis possible.

## Workflows

| Workflow | Trigger | Output |
|----------|---------|--------|
| Project setup | Contract signed | Folder + charter from `TPL_Project_Charter.md` |
| Daily reporting | End of each work day | `TPL_Daily_Report.md` |
| Change management | Scope change requested or discovered | `CO-##`, signed before work |
| Field questions | Ambiguity or conflict | `RFI-##` |
| Substantial completion | Work essentially done | Punch list |
| Closeout | Punch complete | Five closeout artifacts + archive |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `13_Estimating` | Consumes estimates; supplies actuals back |
| `21_Finance` | Supplies invoices and receipts tagged to this project |
| `16_Quality` | Receives punch lists, defects, lessons learned |
| `17_Purchasing` | Supplies POs; receives vendor performance |
| `20_CRM` | Supplies the client; receives satisfaction outcome |
| `04_Case_Studies` | Receives completed-project material |
| `12_Operations` | Supplies the SOPs the project executes |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 4.1 | Project folder generator + charter in use | ⬜ |
| 4.2 | Daily report system | ⬜ |
| 4.3 | CO / RFI / submittal workflow | ⬜ |
| 4.4 | Punch list system | ⬜ |
| 4.6 | Closeout package + gate | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Should past completed jobs be backfilled as `PRJ` records? | Warm-start for historical costs (relates to Q5) |
| — | Photo volume expectation per job? | Media strategy tier in `SYS-0007` |

## Future automation ideas

- `AUT-006` closeout gate — blocks archiving until all five artifacts exist.
- Project folder generator from a signed estimate.
- Photo intake that auto-names from EXIF date and a chosen area/stage.
- Voice-note daily reports.
- Project dashboard: budget vs. actual, schedule variance, open items.

## AI usage notes

Read `00_Project_Charter.md` first — it indexes everything else. When a project
is closing, check all five closeout artifacts and refuse to mark it archived if
any are missing. Never write a project number that isn't registered in
`_Registry/Entity_ID_Registry.csv`.
