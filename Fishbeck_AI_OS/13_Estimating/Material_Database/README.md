---
id: EST-0003
title: Material Database
type: database
domain: 13_Estimating
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-06
review_cycle: quarterly
next_review: 2026-11-06
tags: [estimating, pricing, procurement, database, needs-verification]
related: [SYS-0006, EST-0001, EST-0005]
source_of_truth: true
ai_usage: read-write
confidence: low
---

# Material Database

Unit material costs — what Fishbeck pays for the things it installs. Feeds
assemblies (`ASM-####`) and therefore every estimate.

Migrated from `09_Knowledge_Base/Data_Formats/Material_Costs_Template.csv` and
`09_Knowledge_Base/Material_Costs/` in Phase 1.1.

## Files

| File | Purpose | ID prefix | Rows |
|------|---------|-----------|------|
| `Material_Costs.csv` | Unit material costs | `MAT-####` | 6 |

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | string | `MAT-####` |
| `category` | string | Material grouping |
| `trade` | enum | Taxonomy trade tag per `SYS-0005` |
| `material` | string | Description including grade |
| `unit` | enum | `sf` `lf` `sy` `cy` `ea` `gal` |
| `cost_low` / `cost_high` | number | USD, no symbols |
| `supplier` | string | `VEN-####` once the vendor database exists |
| `region` | string | `twin-cities` |
| `effective_date` | date | When this cost takes force |
| `status` | enum | `active` · `inactive` · `deprecated` |
| `source` | string | Quote, invoice, or reference |
| `confidence` | enum | Per `SYS-0003` |
| `last_updated` | date | |
| `notes` | string | |

## Confidence status

**All 6 rows are `confidence: low`** — every `supplier` and `source` value is
`[confirm]`. These are placeholder ranges with no supplier quote behind them and
they carry `needs-verification`. Per the pricing gate (`SYS-0008`, `DEC-0011`)
they must not be quoted to a client.

Clearing them requires a documented supplier quote — which is why open question
Q2 (preferred suppliers and negotiated discounts) blocks this database.

## Row versioning

Material prices move. Never edit a historical row — deprecate it and add a
superseding row with a later `effective_date` (`SYS-0007`), so past estimates
stay reproducible.

## Relationships

| Domain | Relationship |
|--------|-------------|
| `17_Purchasing` | Supplies real vendor pricing, discounts, and `VEN-####` links |
| `13_Estimating/Assemblies` | Consumes `MAT-####` rows as components |
| `21_Finance` | Receipt actuals validate or correct these costs |

## Future automation ideas

- Receipt OCR (`AUT-005`) auto-updating material costs from real purchases.
- Supplier price feed ingestion.
- Alert when an `effective_date` is older than 90 days (volatile materials).
- Auto-promote confidence once three receipts corroborate a row.

## AI usage notes

Never quote a `low`-confidence material cost to a client. When a receipt shows a
real price, propose a superseding row citing the `RCT-#####` as source.
