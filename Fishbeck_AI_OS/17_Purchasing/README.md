---
id: PUR-0000
title: 17_Purchasing — Vendor and Buying Intelligence
type: readme
domain: 17_Purchasing
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [purchasing, procurement, database, analytics]
related: [SYS-0002, TPL-VENDOR-RECORD]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 17_Purchasing — Vendor and Buying Intelligence

## Purpose

Who Fishbeck buys from, what they charge, how long they take, and whether they
deliver. Material delays are one of the largest sources of schedule loss in
residential construction; this domain exists to make buying predictable.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Vendor and subcontractor records | What materials *cost* in an estimate → `13_Estimating` |
| Purchase orders and pricing history | Payment of invoices → `21_Finance` |
| Lead times, discounts, terms | Subcontractor agreements (legal) → `24_Legal_Risk` |
| Preferred product standards | Equipment Fishbeck owns → `18_Equipment` |
| Vendor performance scoring | |

**The `MAT` / vendor split:** `13_Estimating/Material_Database` holds *what a
material costs for estimating*; this domain holds *who sells it, at what terms,
and how reliably*.

## Source of truth

**Authoritative for:** vendor identity, terms, lead times, compliance status,
performance.
**Defers to:** `13_Estimating` for the estimating cost of a material,
`21_Finance` for what was actually paid.

## Structure

```
17_Purchasing/
├── README.md
├── _Data/
├── Vendor_Database/       VEN-#### suppliers, SUB-#### subcontractors
├── Preferred_Products/    Standard specs Fishbeck defaults to
├── Pricing_History/       Price by SKU over time
├── Purchase_Orders/       PO-####
└── Lead_Times/
```

## Compliance gate — subcontractors

**No subcontractor is scheduled without current documents on file:**

- MN contractor license
- General liability insurance (current)
- Workers' compensation (current)
- W-9
- Signed subcontractor agreement (`CON-####`)
- Agreed lien waiver process

Expiry dates go in front matter `expires` so `AUT-009` can alert before lapse.
An uninsured sub on a jobsite is an existential risk to a small contractor — this
gate is not a formality.

## Preferred products

Standardizing on specific products compounds: crews get faster, quality gets
predictable, pricing gets negotiable, and estimates get accurate.

| Category | Standard product | Why | Vendor |
|----------|-----------------|-----|--------|
| _To be populated in Phase 6.5_ | | | |

## Vendor performance scoring

| Metric | Source | KPI |
|--------|--------|-----|
| On-time delivery rate | PO promised vs. received | `KPI-012` |
| Quality issue rate | Defects traced to material/sub | `DEF-####` |
| Price competitiveness | Pricing history vs. alternatives | — |
| Responsiveness | Quote turnaround | — |

**Status:** preferred / approved / conditional / do-not-use.
Always record *why* for `conditional` and `do-not-use` — an unexplained blacklist
gets forgotten and the vendor gets re-hired.

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Suppliers | `VEN-####` | ⬜ | 6.2 |
| Subcontractors | `SUB-####` | ◐ legacy directory migrating | 1.1 / 6.2 |
| Purchase orders | `PO-####` | ⬜ | 6.2 |
| Preferred products | — | ⬜ | 6.5 |
| Pricing history | — | ⬜ | 6.5 |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `13_Estimating` | Supplies real vendor pricing feeding `MAT` rows |
| `14_Projects` | Consumes POs; supplies delivery performance |
| `21_Finance` | Receives invoices for payment |
| `24_Legal_Risk` | Holds the subcontractor agreements referenced here |
| `16_Quality` | Supplies material- and sub-caused defect data |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1.1 | Absorb legacy `Subcontractor_Directory` → `SUB-####` | ⬜ |
| 6.2 | Vendor database + performance scoring | ⬜ |
| 6.5 | Preferred products and lead-time database | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| Q2 (SYS-0012) | Which suppliers are preferred, and what discounts are negotiated? | `MAT` accuracy, preferred products |
| — | Are current sub insurance certificates on file? | Compliance gate — **check this now, not in Phase 6** |

## Future automation ideas

- `AUT-009` insurance and license expiry alerting.
- Auto-compute on-time delivery from PO promised vs. received dates.
- Price-history tracking per SKU to catch creeping increases.
- Quote comparison across vendors for the same material list.
- Lead-time-aware scheduling that orders long-lead items automatically.

## AI usage notes

Check compliance status before recommending any subcontractor for scheduling,
and never recommend a `do-not-use` vendor. When pricing materials, prefer
`preferred` vendors and apply their recorded discount. Flag expired insurance
immediately and unprompted — it is the highest-consequence data in this domain.
