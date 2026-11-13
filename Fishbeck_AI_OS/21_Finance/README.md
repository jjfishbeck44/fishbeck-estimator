---
id: FIN-0000
title: 21_Finance — The Money Record
type: readme
domain: 21_Finance
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: monthly
next_review: 2026-08-31
tags: [finance, accounting, job-costing, database]
related: [SYS-0002, DEC-0002]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 21_Finance — The Money Record

## Purpose

What was invoiced, what was spent, what was paid, and what it means job by job.
Established per `DEC-0002` — the original domain list had no home for "every
receipt and invoice," and job costing is what turns revenue into knowledge.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Invoices, receipts, payments | What things *should* cost → `13_Estimating` |
| Job costing (actuals per project) | Vendor terms → `17_Purchasing` |
| Budgets, cash flow, AR/AP | KPI targets → `11_Executive` |
| Tax document organization | Analysis and reporting → `22_Analytics` |
| Payroll records | Employment policy → `19_HR` |

## Source of truth

**Authoritative for:** every dollar in and out. When any other domain disagrees
with Finance about money, Finance is right.

**Critical distinction:** `13_Estimating` holds what things *should* cost;
`21_Finance` holds what they *actually* cost. The gap between the two is
`KPI-001` estimate accuracy — the most valuable number in the company. Keeping
them in separate domains is what makes measuring that gap possible.

## Structure

```
21_Finance/
├── README.md
├── _Data/
│   ├── Invoices.csv       INV-####
│   ├── Receipts.csv       RCT-#####
│   └── Job_Costing.csv    Actuals by project and category
├── Invoices/
├── Receipts/              Filed per SYS-0004 naming
├── Budgets/
├── Cash_Flow/
├── Payroll/
└── Tax/
```

## Job costing — the core function

Every dollar is tagged to a project and a cost category:

| Category | Feeds |
|----------|-------|
| Labor | `LAB-####` recalibration |
| Materials | `MAT-####` recalibration |
| Subcontractor | Sub pricing benchmarks |
| Equipment / rental | Estimate line accuracy |
| Permits / fees | Fixed cost baselines |
| Overhead allocation | Markup validation |

At closeout these roll into `HC-#####` historical cost rows in `13_Estimating`.
**An untagged receipt is lost data** — it becomes a number in a bank account
instead of intelligence that improves the next estimate.

## Receipt discipline

Per `SYS-0004`: `YYYY-MM-DD_VEN-####_PRJ-####_amount.pdf`

Every receipt needs a project tag at the moment of purchase. Retroactive tagging
is unreliable and is where job cost data usually dies. This is the highest-value
habit in the entire operating system, and the hardest to sustain manually —
which is exactly why `AUT-005` (receipt OCR) is a priority automation.

## Payment terms

| Item | Standard |
|------|----------|
| Deposit | <%> at contract signing |
| Progress payments | Per milestone schedule |
| Final payment | On substantial completion, less punch retainage |
| Client terms | Net <n> days |
| Late fee | <%> |

`[confirm]` — these need owner input before they appear in any contract.

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Invoices | `INV-####` | ⬜ | 6.3 |
| Receipts | `RCT-#####` | ⬜ | 6.3 |
| Job costing | — | ⬜ | 6.3 |
| Cash flow / AR | — | ⬜ | 6.4 |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `14_Projects` | Every transaction tags to a project |
| `13_Estimating` | Receives actuals; supplies the estimate being measured against |
| `17_Purchasing` | Supplies vendor invoices |
| `22_Analytics` | Consumes this data for margin and accuracy reporting |
| `11_Executive` | Receives revenue and profit reality |
| `24_Legal_Risk` | Lien waivers tie to payment records |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 6.3 | Invoice / receipt / job costing schema | ⬜ |
| 6.4 | Cash flow and AR tracking | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| Q5 (SYS-0012) | Is there existing invoice/receipt history to seed job costing? | Warm vs. cold start on `KPI-001` |
| Q6 (SYS-0012) | What accounting system is in use (QuickBooks, spreadsheets)? | Integration design — mirror vs. source |
| — | Standard payment terms and deposit percentage? | Contract templates in `24_Legal_Risk` |

## Future automation ideas

- `AUT-005` receipt OCR → auto-tagged `RCT-#####` rows. Highest-value automation
  in the OS by recurring hours saved.
- Accounting system sync (QuickBooks API) so this domain mirrors rather than
  duplicates.
- Automatic job cost rollup to `HC-#####` at closeout.
- AR aging alerts feeding `KPI-014` days sales outstanding.
- Cash flow forecast from the committed project pipeline.

## AI usage notes

Financial records are sensitive: never include account numbers, card details, or
banking information in generated content. Never commit statements containing
account numbers. When reporting financial figures, always state the period and
the source file. Tax and accounting treatment questions go to a CPA — draft
organization, not advice.
