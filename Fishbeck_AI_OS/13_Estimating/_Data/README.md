---
id: EST-0005
title: 13_Estimating — Data Schemas
type: database
domain: 13_Estimating
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-06
review_cycle: quarterly
next_review: 2026-11-06
tags: [estimating, database, standard]
related: [SYS-0003, SYS-0006, TPL-DATABASE-SCHEMA]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 13_Estimating — Data Schemas

Canonical schema reference for the estimating databases. Migrated from
`09_Knowledge_Base/Data_Formats/` in Phase 1.1.

**Do not change a column structure without a `DEC-####` decision record**
(`SYS-0007`). Add rows; don't rename or reorder columns.

## Where the data actually lives

The databases moved out of this folder into the subdomain that owns them. This
folder now holds only schema reference material.

| Database | Location | ID prefix |
|----------|----------|-----------|
| Unit pricing | `../Unit_Pricing/Market_Rates_2024.csv` | `UP-####` |
| Material costs | `../Material_Database/Material_Costs.csv` | `MAT-####` |
| Production rates | `../Production_Rates/Production_Rates.csv` | `PRD-####` |
| Assemblies | `../Assemblies/` (Phase 2.4) | `ASM-####` |
| Labor rates | `../Labor_Database/` (Phase 2.2) | `LAB-####` |
| Historical costs | `../Historical_Costs/` (Phase 2.6) | `HC-#####` |
| Estimates | `../Estimates/` | `EST-####` |

## Files in this folder

| File | Purpose |
|------|---------|
| `Pricing_Template.csv` | **Schema example only.** `PR-####` rows illustrating the unit-pricing shape. Not quotable — real pricing is in `../Unit_Pricing/`. |

## Mandatory columns

Per `SYS-0003`, every CSV in the OS carries these five:

| Column | Purpose |
|--------|---------|
| `status` | `active` · `inactive` · `deprecated` |
| `source` | Where the value came from |
| `confidence` | `high` · `medium` · `low` · `unverified` |
| `last_updated` | `YYYY-MM-DD` |
| `notes` | Free text |

Plus a stable `id` with a prefix from `SYS-0006`.

## Estimating-specific required columns

| Column | Why |
|--------|-----|
| `effective_date` | Reproduce any past estimate with the pricing then in force |
| `unit` | Closed set: `sf` `lf` `sy` `cy` `ea` `hr` `day` `gal` |
| `trade` | Enables trade-level variance analysis |
| `region` | `twin-cities` default; supports future expansion |
| `legacy_id` | Crosswalk for pre-`SYS-0006` IDs (`SW-01` → `UP-0001`) |

## Conventions

- Currency: plain numbers, no `$` or commas — `4500`, `12.75`
- Dates: `YYYY-MM-DD`
- Booleans: `true` / `false`
- Multi-value cells: **pipe-delimited** (`MAT-0012|MAT-0034`), never commas (`DEC-0008`)
- Empty: leave blank; `[confirm]` only for an expected-but-unverified value

## Row versioning

Never edit a historical value in place. Deprecate the row and add a superseding
row with a new ID and a later `effective_date` (`SYS-0007`). This is what makes
estimate-accuracy scoring possible — the estimate cites `UP-0012`, and that row
still exists even after the price changes.

## Consumers

Per `DEC-0007`, these are generated consumers and never independent sources:

| Consumer | Sync method |
|----------|-------------|
| `lib/prompt.js` | Manual today → `AUT-004` |
| `public/js/calculators/pricing.js` | Manual today → `AUT-004` |

## Validation rules

- [ ] Every `id` unique and prefix-correct
- [ ] Every foreign key resolves
- [ ] `price_low <= price_high` / `cost_low <= cost_high` / `rate_low <= rate_high`
- [ ] Units drawn from the closed set
- [ ] No `confidence: high` pricing row without job data or a supplier quote
- [ ] Nothing below `confidence: high` used in client-facing output

## Future automation ideas

- CSV schema validator in CI (`AUT-001` family).
- Referential integrity check across all estimating databases.
- Migration to SQLite once rows exceed ~5,000.

## AI usage notes

Read this file before reading or writing any estimating CSV. Never add a column
without a decision record. Never quote a row below `confidence: high` to a client.
