---
id: EXEC-0000
title: 11_Executive — Strategy and Company Performance
type: readme
domain: 11_Executive
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [strategy, governance, analytics]
related: [SYS-0002, SYS-0010]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 11_Executive — Strategy and Company Performance

## Purpose

Where the company is going, how it will get there, and whether it's working.
Without this domain, every other domain optimizes locally with no shared target.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Business plan, strategic plan, annual goals | Brand identity and messaging → `00_Brand` |
| Quarterly OKRs, KPI targets, company scorecard | KPI *calculation* → `22_Analytics` |
| Market positioning and growth decisions | Financial transactions → `21_Finance` |
| Owner-level decisions with company-wide impact | OS structural decisions → `_System/Decision_Log.md` |

## Source of truth

**Authoritative for:** company goals, KPI *targets*, OKRs, strategic direction.
**Defers to:** `22_Analytics` for actual measured values, `21_Finance` for
financial reality, `_Registry/KPI_Registry.csv` for KPI definitions.

The split matters: this domain sets the target, Analytics reports the number.

## Structure

```
11_Executive/
├── README.md
├── Business_Plan/
├── Strategic_Plan/
├── Annual_Goals/
├── OKRs/              OKR-### by quarter
└── Scorecard/         Company scorecard, monthly snapshots
```

## Contents

| Item | ID prefix | Purpose | Status |
|------|-----------|---------|--------|
| Business plan | — | Full plan; funding and direction | ⬜ Phase 7.4 |
| Strategic plan | — | 3-year direction toward commercial GC and SaaS | ⬜ Phase 7.4 |
| Annual goals | — | Current-year targets | ⬜ Phase 7.3 |
| Quarterly OKRs | `OKR-###` | Objectives and key results | ⬜ Phase 7.3 |
| KPI targets | `KPI-###` | Targets for `_Registry/KPI_Registry.csv` | ◐ 15 defined, 5 targets `[confirm]` |
| Company scorecard | — | One page, monthly | ⬜ Phase 7.2 |

## Workflows

| Workflow | Trigger | Steps | Output |
|----------|---------|-------|--------|
| Quarterly OKR cycle | Quarter start | Review prior quarter → set 3–5 objectives → assign KRs to KPIs | `OKR-###` |
| Monthly scorecard | Month close | Pull actuals from `22_Analytics` → compare to target → note actions | Scorecard entry |
| Annual planning | Year end | Review performance → set annual goals → cascade to quarterly OKRs | Annual goals |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `22_Analytics` | Supplies measured actuals against these targets |
| `21_Finance` | Supplies revenue, margin, and cash reality |
| `_Registry/KPI_Registry.csv` | Holds the KPI definitions this domain sets targets for |
| All domains | Receive direction from the strategic plan |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 7.1 | KPI targets populated (5 currently `[confirm]`) | ⬜ |
| 7.2 | Company scorecard | ⬜ |
| 7.3 | Quarterly OKR system | ⬜ |
| 7.4 | Business plan + strategic plan | ⬜ |

**Dependency:** meaningful targets require baseline data. Phases 2, 5, and 6 must
produce real numbers first — setting targets before baselines produces fiction.

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| Q2 (SYS-0012) | Target gross and net margin percentages | `KPI-002`, `KPI-003` |
| Q4 (SYS-0012) | Revenue baseline and growth target | `KPI-004` |
| — | Timeline for the commercial GC transition | Strategic plan |

## Future automation ideas

- Scorecard auto-generated from `22_Analytics` outputs — no manual assembly.
- OKR progress tracked automatically where key results map to KPIs.
- Alert when a KPI trends away from target for two consecutive periods.

## AI usage notes

Never set a KPI target without a baseline — say "no baseline exists yet" instead.
Targets marked `[confirm]` are placeholders and must not be presented as company
goals.
