---
id: EST-0004
title: Production Rates Database
type: database
domain: 13_Estimating
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-06
review_cycle: quarterly
next_review: 2026-11-06
tags: [estimating, operations, database, needs-verification]
related: [SYS-0006, EST-0001, EST-0005]
source_of_truth: true
ai_usage: read-write
confidence: low
---

# Production Rates Database

How fast work actually goes. Production rates convert a quantity into labor
hours, which is what turns a takeoff into a price and a schedule.

Migrated from `09_Knowledge_Base/Data_Formats/Production_Rates_Template.csv` and
`09_Knowledge_Base/Production_Rates/` in Phase 1.1.

## Files

| File | Purpose | ID prefix | Rows |
|------|---------|-----------|------|
| `Production_Rates.csv` | Labor production rates | `PRD-####` | 5 |

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | string | `PRD-####` |
| `trade` | enum | Taxonomy trade tag per `SYS-0005` |
| `task` | string | Specific operation |
| `unit` | string | Unit of the quantity measured |
| `rate_low` / `rate_high` | number | Achievable range |
| `rate_unit` | string | `sqft_per_hr`, `sqft_per_day`, `units_per_crew_day` |
| `crew_size` | number | People assumed in the rate |
| `region` | string | `twin-cities` |
| `effective_date` | date | |
| `status` | enum | `active` · `inactive` · `deprecated` |
| `source` | string | |
| `confidence` | enum | Per `SYS-0003` |
| `last_updated` | date | |
| `notes` | string | |

**`crew_size` is load-bearing.** A rate of "400 sf/day" means nothing without
knowing whether that is one person or three.

## Current rows

| ID | Trade | Task |
|----|-------|------|
| `PRD-0001` | painting | Roll walls (cut & roll) |
| `PRD-0002` | flooring | Install LVP |
| `PRD-0003` | drywall | Hang drywall |
| `PRD-0004` | demolition | Interior selective demo |
| `PRD-0005` | general-labor | Full standard turn (composite) |

`PRD-0005` is a composite covering an entire rental turn rather than a single
trade operation. It properly belongs in `Assemblies/` as an `ASM-####` once that
database exists (Phase 2.4); it is retained here unchanged for now.

## Confidence status

**All 5 rows are `confidence: low`** — every `source` is `[confirm]`. These are
industry rules of thumb, not measured Fishbeck output, and they carry
`needs-verification`.

**This is the cheapest gap in the OS to close.** Unlike pricing (which needs
supplier quotes) production rates are captured for free as a byproduct of daily
reports: the `TPL_Daily_Report.md` `rate achieved` column exists precisely to
feed this table. Three jobs of daily reports would move these to `high`.

## Relationships

| Domain | Relationship |
|--------|-------------|
| `14_Projects` | Daily reports supply measured `rate achieved` values |
| `12_Operations` | SOPs cite these rows for time baselines |
| `13_Estimating/Assemblies` | Consumes `PRD-####` as the labor component |
| `22_Analytics` | Computes `KPI-005` labor efficiency against these rates |

## Recalibration rule

When three or more jobs disagree with a rate, propose a superseding row — do not
edit in place (`SYS-0007`). Consistent variance means the rate is wrong; random
variance means the scoping is.

## Future automation ideas

- Auto-compute `rate achieved` from daily reports and flag >20% variance.
- Recalibration proposals generated when 3+ jobs corroborate a different rate.
- Split rates by crew experience level once there is enough data.

## AI usage notes

Always report `crew_size` alongside a rate. Never quote a `low`-confidence rate
as a schedule commitment. When daily report data arrives, propose superseding
rows rather than editing.
