---
id: EST-0000
title: 13_Estimating — Cost Intelligence
type: readme
domain: 13_Estimating
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [estimating, pricing, database, analytics]
related: [SYS-0002, SYS-0006, TPL-ESTIMATE, DEC-0007]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 13_Estimating — Cost Intelligence

## Purpose

The company's cost brain. Every price Fishbeck quotes originates here, and every
dollar actually spent flows back here. **This is the highest-value domain in the
operating system** — it is the difference between guessing and knowing.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Material, labor, production rate, assembly, and unit price databases | Actual invoices and payments → `21_Finance` |
| Estimates and the estimating method | Vendor relationships and terms → `17_Purchasing` |
| Historical cost records (actuals rolled up) | Project execution records → `14_Projects` |
| Markup, overhead, and contingency standards | Proposal formatting and sales copy → `06_Sales_Marketing` |

## Source of truth

**Authoritative for every cost number in the company.** Per `DEC-0007`, these
are *consumers* and must be regenerated from here, never edited independently:

| Consumer | File | Sync |
|----------|------|------|
| Estimator API prompt | `lib/prompt.js` | Manual today → `AUT-004` |
| Calculator tools | `public/js/calculators/pricing.js` | Manual today → `AUT-004` |
| Proposals and bids | `06_Sales_Marketing/Bid_Templates/` | Manual |

> **Highest-risk item in the OS.** Three files currently hold pricing and can
> disagree about what a job costs. Resolving this is Phase 1.4.

## Structure

```
13_Estimating/
├── README.md
├── _Data/                 Schema documentation for every CSV here
├── Material_Database/     MAT-#### — what materials cost
├── Labor_Database/        LAB-#### — burdened crew rates
├── Production_Rates/      PRD-#### — how fast work goes
├── Assemblies/            ASM-#### — composed units of work
├── Unit_Pricing/          UP-####  — client-facing ranges
├── Historical_Costs/      HC-##### — what jobs actually cost
└── Estimates/             EST-#### — issued estimates
```

## The data model

```
MAT (material cost)  ┐
LAB (labor rate)     ├──→ ASM (assembly) ──→ UP (unit price) ──→ EST (estimate)
PRD (production rate)┘                                              │
                                                                    ▼
HC (historical cost) ←──────── actuals from 14_Projects ────── PRJ (project)
     │
     └──→ recalibrates MAT / LAB / PRD          ← THE FEEDBACK LOOP
```

**Why assemblies matter.** A raw unit price ("drywall $2/sf") can't explain
itself or adapt. An assembly decomposes into hang labor (`LAB`), finish labor
(`LAB`), board and mud (`MAT`), and a production rate (`PRD`) — so when lumber
prices move or a crew gets faster, every estimate updates correctly and you can
see exactly why.

## Contents

| Database | ID prefix | Rows | Status | Phase |
|----------|-----------|------|--------|-------|
| Material | `MAT-####` | 0 | ⬜ | 2.1 |
| Labor | `LAB-####` | 0 | ⬜ blocked on Q1 | 2.2 |
| Production rates | `PRD-####` | 4 legacy | ◐ migrating | 2.3 |
| Assemblies | `ASM-####` | 0 | ⬜ | 2.4 |
| Unit pricing | `UP-####` | ~60 legacy (`SW-##` style) | ◐ migrating | 2.5 |
| Historical costs | `HC-#####` | 0 | ⬜ | 2.6 |
| Estimates | `EST-####` | 0 | ⬜ | — |

## Required fields

Beyond the mandatory CSV columns in `SYS-0003`, cost rows require:

| Field | Why |
|-------|-----|
| `effective_date` | Reproduce any past estimate with the pricing then in force |
| `unit` | From the closed set: `sf` `lf` `sy` `cy` `ea` `hr` `day` |
| `trade` | Enables trade-level variance analysis |
| `region` | Twin Cities default; supports future expansion |
| `legacy_id` | Crosswalk for pre-`SYS-0006` IDs (`SW-01` → `UP-0001`) |

## Pricing gate

Per `SYS-0008`, no pricing row becomes `active` without either:

- **(a)** three real job data points, or
- **(b)** a documented supplier quote.

Otherwise it stays `confidence: low` and tagged `needs-verification`, and **may
not be quoted to a client.** This gate is what stops the estimator from
laundering guesses into confident-looking numbers.

## Workflows

| Workflow | Trigger | Output |
|----------|---------|--------|
| Build an estimate | Qualified lead | `EST-####` per `TPL_Estimate.md`, every line citing a source ID |
| Capture actuals | Project closeout | `HC-#####` rows linked to their `EST-####` |
| Recalibrate rates | 3+ jobs disagree with a `PRD`/`MAT` row | Superseding row with new `effective_date` |
| Quarterly price review | `next_review` | Verified or superseded rows |
| Regenerate consumers | Any pricing change | Updated `lib/prompt.js`, `pricing.js` |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `14_Projects` | Supplies actuals; consumes estimates |
| `21_Finance` | Supplies invoice and receipt reality for historical costs |
| `17_Purchasing` | Supplies vendor pricing and discounts feeding `MAT` |
| `22_Analytics` | Computes `KPI-001` estimate accuracy from `EST` ↔ `HC` |
| `12_Operations` | SOPs cite `PRD` rows for time baselines |
| Estimator app | Pure consumer — never a source (`DEC-0007`) |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1.1 | Absorb legacy KB pricing/materials/rates | ⬜ |
| 1.4 | Resolve three-way pricing duplication | ⬜ |
| 2.1–2.7 | Build the seven databases | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| Q1 (SYS-0012) | Actual burdened labor rates for crews and subs | Entire `LAB` database |
| Q2 (SYS-0012) | Preferred suppliers and negotiated discounts | `MAT` accuracy |
| Q3 (SYS-0012) | Standard overhead and profit by project type | Estimate totals |
| Q5 (SYS-0012) | Existing invoice history to seed `HC`? | Whether the loop starts warm or cold |

## Future automation ideas

- `AUT-004` — generate `lib/prompt.js` and `pricing.js` from these CSVs.
- `AUT-007` — automated estimate accuracy scoring by trade.
- Supplier price feed ingestion to keep `MAT` current without manual entry.
- Assembly builder that composes `ASM` rows from `MAT` + `LAB` + `PRD`.
- Alert on any estimate citing a source row older than 90 days.

## AI usage notes

**Never invent a cost.** Every number comes from a cited row or is marked
`[confirm]` with `confidence: unverified`. Never edit a historical row — add a
superseding row (`SYS-0007`). When asked "what does X cost" and no row exists,
say so and propose capturing it on the next job. A stated gap is a deliverable;
a fabricated number is a liability.
