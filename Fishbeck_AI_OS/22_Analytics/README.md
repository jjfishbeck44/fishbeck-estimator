---
id: ANL-0000
title: 22_Analytics — Measurement and Reporting
type: readme
domain: 22_Analytics
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: monthly
next_review: 2026-08-31
tags: [analytics, estimating, finance, automation]
related: [SYS-0002, SYS-0010]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 22_Analytics — Measurement and Reporting

## Purpose

Turn the OS's accumulated data into decisions. Analytics is deliberately late in
the build order: measuring before there is real data produces confident charts of
nothing.

## Scope

| In scope | Out of scope |
|----------|--------------|
| KPI calculation and reporting | KPI *targets* → `11_Executive` |
| Estimate accuracy analysis | Raw financial records → `21_Finance` |
| Labor efficiency, vendor performance, material trends | Project records → `14_Projects` |
| Dashboards and periodic reports | Website/SEO analytics → `02_SEO` |

## Source of truth

**Authoritative for:** calculated metrics and their methodology.
**Defers to:** every domain that owns the underlying raw data. Analytics never
holds a primary fact — it computes over facts owned elsewhere. If a number here
disagrees with its source domain, the source wins and the calculation is wrong.

## Structure

```
22_Analytics/
├── README.md
├── _Data/                    Computed metric snapshots by period
├── Estimate_Accuracy/        KPI-001 — the flagship analysis
├── Financial/                Revenue, margin, cash
├── Labor_Efficiency/         KPI-005
├── Vendor_Performance/       KPI-012
├── Material_Trends/          Price movement over time
└── Reports/                  Monthly and quarterly outputs
```

## The flagship analysis — estimate accuracy

`KPI-001` is the single most valuable number Fishbeck can compute:

```
For each completed project:
    EST-####  (estimated, line by line with source IDs)
        ↕
    HC-#####  (actual, from 21_Finance job costing)

    variance % = (actual - estimated) / estimated
```

Broken down by trade, project type, and estimate basis. This tells you not just
*that* estimates are off, but **which specific database rows are wrong** — so
they can be fixed rather than padded.

Consistent variance in one trade means that trade's `PRD` or `MAT` rows need
recalibration. Random variance means the scoping process is the problem. These
require completely different fixes, and only the data distinguishes them.

## Metric catalogue

All fifteen KPIs are defined in `_Registry/KPI_Registry.csv` — definitions,
formulas, targets, and data sources. **That registry is the source of truth for
what a metric means**; this domain computes it.

| Priority | Metric | Blocked until |
|----------|--------|---------------|
| 1 | `KPI-001` Estimate accuracy | Phase 5.1 — needs `HC` rows |
| 2 | `KPI-002/003` Margin | Phase 6.3 — needs job costing |
| 3 | `KPI-005` Labor efficiency | Phase 4.2 — needs daily reports |
| 4 | `KPI-006` Change order rate | Phase 4.3 |
| 5 | `KPI-007` Callback rate | Phase 5.4 |
| 6 | `KPI-012` Vendor on-time | Phase 6.2 |

## Reporting cadence

| Report | Frequency | Audience | Contents |
|--------|-----------|----------|----------|
| Project closeout report | Per project | Owner | Budget vs. actual, schedule, lessons |
| Monthly scorecard | Monthly | Owner | All active KPIs vs. target |
| Quarterly review | Quarterly | Owner | Trends, OKR progress, rate recalibration |
| Annual review | Annual | Owner | Full year, strategic input |

## Analysis principles

1. **Small samples lie.** State the sample size on every metric. Three projects
   is an anecdote, not a trend.
2. **Segment before concluding.** Aggregate margin hides that rental turns are
   profitable and remodels aren't.
3. **Every metric needs an action.** A metric nobody acts on gets deleted.
4. **Show the source.** Every reported number cites the file it came from.
5. **Trend over snapshot.** Direction matters more than a single period.

## Relationships

| Domain | Relationship |
|--------|-------------|
| `13_Estimating` | Supplies estimates and historical costs; **receives recalibration recommendations** |
| `21_Finance` | Supplies actual revenue and cost |
| `14_Projects` | Supplies schedule, change orders, daily production |
| `16_Quality` | Supplies defect and callback data |
| `17_Purchasing` | Supplies vendor delivery performance |
| `11_Executive` | Receives results; supplies the targets to compare against |

The feedback arrow to `13_Estimating` is what makes this domain worth building —
analytics that doesn't change the estimating database is just reporting.

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 7.1 | KPI definitions populated | ✅ 15 defined in `_Registry` |
| 7.2 | Company scorecard | ⬜ |
| 7.5 | Margin, labor, vendor reporting | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| Q5 (SYS-0012) | Historical job data available to backfill? | Whether analysis can start now or must wait ~6 months |

## Future automation ideas

- `AUT-007` automated estimate accuracy scoring at every closeout.
- Auto-generated monthly scorecard — no manual assembly.
- Alert when a KPI trends away from target two periods running.
- Material price trend tracking with lead-time-aware buy recommendations.
- Recalibration proposals generated automatically when 3+ jobs disagree with a
  `PRD` or `MAT` row.

## AI usage notes

Never report a metric without its sample size and source. Never compute a KPI
whose underlying data doesn't exist yet — say it's blocked and name the phase
that unblocks it. When analysis reveals a systematically wrong database row,
propose the correction to `13_Estimating` explicitly; that is the entire point of
this domain.
