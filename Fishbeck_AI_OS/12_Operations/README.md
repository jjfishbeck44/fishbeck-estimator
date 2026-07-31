---
id: OPS-0000
title: 12_Operations — How the Work Gets Done
type: readme
domain: 12_Operations
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [operations, sop, scheduling, project-management]
related: [SYS-0002, TPL-SOP]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 12_Operations — How the Work Gets Done

## Purpose

The repeatable procedures that make quality independent of who shows up. This is
the domain that turns a skilled owner-operator into a company that can scale.

## Scope

| In scope | Out of scope |
|----------|--------------|
| SOPs for every recurring process | Individual job records → `14_Projects` |
| Scheduling and crew capacity | Technical how-to and code → `15_Construction_Knowledge` |
| Client communication cadence | Verification checklists → `16_Quality` |
| Change order and warranty process | Vendor selection → `17_Purchasing` |
| Project closeout procedure | Employment policy → `19_HR` |

**SOP vs. checklist:** the SOP teaches how; the checklist verifies it happened.
**SOP vs. knowledge:** the SOP says what Fishbeck does; the knowledge base says
what the code requires.

## Source of truth

**Authoritative for:** how Fishbeck performs work, process ownership, escalation.
**Defers to:** `15_Construction_Knowledge` for code and technical standards,
`13_Estimating` for the cost and time numbers cited inside SOPs.

SOPs cite `PRD-####` and `MAT-####` IDs rather than restating numbers.

## Structure

```
12_Operations/
├── README.md
├── SOP_Library/        SOP-#### — the core asset
├── Scheduling/         Crew capacity, calendars, sequencing
├── Client_Communication/
├── Change_Orders/      Process (records live in 14_Projects)
├── Warranty/
└── Closeout/
```

## Planned SOP library

Ordered by business value — highest-volume and highest-risk first.

| ID | SOP | Why it matters | Phase |
|----|-----|----------------|-------|
| `SOP-0001` | Rental turn / unit turnover | Highest-volume service; most repeatable | 3.1 |
| `SOP-0002` | Property assessment walkthrough | Front door for most leads; feeds the estimate | 3.2 |
| `SOP-0003` | Change order process | Directly protects margin | 3.3 |
| `SOP-0004` | Client communication cadence | Drives satisfaction and referrals | 3.4 |
| `SOP-0005` | Jobsite setup, safety, cleanup | Risk reduction; first impression | 3.5 |
| `SOP-0006` | Project closeout | Enforces the `DEC-0010` feedback loop | 3.6 |
| `SOP-0007` | Material procurement and staging | Reduces delay days | 3.7 |
| `SOP-0008` | Subcontractor onboarding and scheduling | Compliance and reliability | 3.7 |
| `SOP-0009` | Punch list and warranty response | Callback rate (`KPI-007`) | 3.7 |
| `SOP-0010` | Estimate-to-contract handoff | Prevents scope drift between sale and build | 3.7 |

## Workflows

| Workflow | Trigger | Output |
|----------|---------|--------|
| New SOP | Process performed 3+ times, or a lesson learned demands it | `SOP-####` |
| SOP revision | Lessons learned or RCA naming this SOP | Version bump |
| Semiannual review | `next_review` date | Confirmed or revised SOP |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `13_Estimating` | SOPs cite production rates; SOP steps define what gets estimated |
| `14_Projects` | Projects execute these SOPs and produce the records |
| `16_Quality` | Checklists verify SOP compliance; lessons learned revise SOPs |
| `15_Construction_Knowledge` | Supplies the code requirements SOPs must satisfy |
| `05_Digital_Products` | The SOP Pack is a *derived* product, not a second source |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1.1 | Absorb legacy `09_KB/SOPs` and `Construction_Management` | ⬜ |
| 3.1–3.6 | Core six SOPs | ⬜ |
| 3.7 | Scheduling and capacity model | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Typical crew composition and count | `SOP-0001` time baselines |
| Q4 (SYS-0012) | W-2 employees or 1099 subs only? | `SOP-0008` |

## Future automation ideas

- SOP → mobile checklist generation so the field uses the current version.
- Auto-flag SOPs referenced by lessons learned but not updated since.
- Scheduling model that reads production rates to auto-sequence a job.
- Link each SOP to its actual duration data from daily reports.

## AI usage notes

When asked how Fishbeck does something, read the SOP library first. If no SOP
covers it, say so and propose one rather than improvising an answer — an
invented procedure presented as company practice is worse than no answer.
