---
id: EQP-0000
title: 18_Equipment — Tool and Asset Management
type: readme
domain: 18_Equipment
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [equipment, maintenance, database]
related: [SYS-0002, SYS-0006]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 18_Equipment — Tool and Asset Management

## Purpose

Know what Fishbeck owns, where it is, whether it works, and what it costs to
keep. Tools walk off jobsites, warranties expire unclaimed, and rental decisions
get made on instinct — this domain fixes all three.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Owned tools, equipment, and vehicles | Rented equipment costs on a job → `13_Estimating` |
| Maintenance and calibration schedules | Vendor relationships → `17_Purchasing` |
| Warranty and purchase history | Equipment purchases as expense → `21_Finance` |
| Assignment and location tracking | Consumables and materials → `13_Estimating` |

## Source of truth

**Authoritative for:** what Fishbeck owns, condition, location, maintenance state.
**Defers to:** `21_Finance` for depreciation and book value, `17_Purchasing` for
where it was bought.

## Structure

```
18_Equipment/
├── README.md
├── _Data/
│   └── Equipment_Inventory.csv    EQP-####
├── Maintenance/                   Schedules and logs
├── Calibration/                   Levels, lasers, moisture meters
├── Warranty/
└── QR_Tracking/                   Label scheme and scan destinations
```

## Proposed inventory schema

| Column | Purpose |
|--------|---------|
| `id` | `EQP-####` |
| `name`, `category`, `make`, `model`, `serial` | Identity |
| `purchase_date`, `purchase_price`, `vendor_id` | Acquisition |
| `warranty_expires` | Drives `AUT-009` alerting |
| `condition` | `new` · `good` · `fair` · `needs-repair` · `retired` |
| `assigned_to` | `EMP-####` or `shop` |
| `current_location` | `PRJ-####`, shop, or vehicle |
| `maintenance_interval`, `last_maintenance`, `next_maintenance` | Upkeep |
| `calibration_required`, `last_calibration` | Accuracy-critical tools |
| `replacement_cost` | Insurance and rent-vs-buy decisions |

Plus the mandatory `status` · `source` · `confidence` · `last_updated` · `notes`.

## QR tracking

Each asset gets a durable QR label encoding its `EQP-####`, resolving to its
record. Scanning supports: check-out to a project, condition reporting,
maintenance logging, and a manifest at end of job.

**Build trigger:** worth doing once inventory exceeds roughly $10,000 or tools
regularly move between crews. Below that, the CSV alone is enough — premature
tracking infrastructure is its own kind of waste.

## Rent vs. buy

A tracked benefit of this domain. The decision compares purchase price plus
maintenance against rental cost times expected annual uses — informed by the
existing tool-rental calculator in the estimator app.

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Inventory | `EQP-####` | ⬜ | 9.2 |
| Maintenance schedules | — | ⬜ | 9.2 |
| QR tracking | — | ⬜ | 9.2 (triggered) |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `14_Projects` | Equipment assigned to jobs; returned at closeout |
| `17_Purchasing` | Where equipment was bought; warranty claims |
| `21_Finance` | Purchase cost, depreciation, insurance schedule |
| `19_HR` | Assignment to crew members and accountability |
| `13_Estimating` | Equipment cost as a line item in estimates |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 9.2 | Inventory CSV | ⬜ |
| 9.2 | Maintenance schedule | ⬜ |
| 9.2 | QR tracking (if triggered) | ⬜ |

**Priority note:** this is a Phase 9 growth domain — build it when the trigger
condition is real, not before.

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Current tool inventory value? | Whether QR tracking is justified yet |
| — | Are tools currently insured, and is a schedule required? | `24_Legal_Risk` insurance coverage |

## Future automation ideas

- QR scan → check-out/check-in with no typing.
- Maintenance due alerts from `next_maintenance`.
- Warranty expiry alerting (`AUT-009`).
- End-of-job tool manifest so nothing is left behind.
- Rent-vs-buy analysis fed by actual usage frequency.

## AI usage notes

Do not build this domain out speculatively — it is trigger-based. When asked
about equipment before the inventory exists, say the inventory hasn't been built
yet rather than describing hypothetical assets.
