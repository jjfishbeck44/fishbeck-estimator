---
id: RE-0000
title: 23_Real_Estate — Investment Analysis
type: readme
domain: 23_Real_Estate
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [investor, flip, analysis, database]
related: [SYS-0002, SYS-0006]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 23_Real_Estate — Investment Analysis

## Purpose

Evaluate properties as investments — for Fishbeck's own future acquisitions and
as a service to investor clients. Fishbeck's competitive advantage here is
unusual and real: **most investors guess at rehab cost, and Fishbeck will have a
verified cost database.**

## Scope

| In scope | Out of scope |
|----------|--------------|
| Rental (buy-and-hold) analysis | Rehab cost data → `13_Estimating` |
| Flip analysis and ARV estimation | Construction execution → `14_Projects` |
| Property intelligence and due diligence | Investor relationships → `20_CRM` |
| Market data by neighborhood | Company financials → `21_Finance` |

## Source of truth

**Authoritative for:** property-level investment analysis, ARV comps, market
assumptions.
**Defers to:** `13_Estimating` for **every** rehab cost figure. An analysis that
invents rehab numbers defeats the entire advantage.

## Structure

```
23_Real_Estate/
├── README.md
├── _Data/
│   ├── Properties.csv       PRP-####
│   └── ARV_Database.csv     Comps and realized values
├── Rental_Analysis/
├── Flip_Analysis/
├── Property_Intelligence/   Neighborhood and market notes
└── Due_Diligence/           Checklists and findings
```

## Analysis models

### Flip

```
ARV
− Purchase price
− Rehab cost           ← from 13_Estimating assemblies, not guessed
− Holding costs        (taxes, insurance, utilities, financing × months)
− Selling costs        (commission, closing, concessions)
− Buffer               (contingency %)
= Projected profit
```

Key checks: profit margin %, ROI, cash-on-cash, and **days to complete** — driven
by real production rates from `13_Estimating`, which is the number most investors
get badly wrong.

### Rental

```
Gross rent
− Vacancy (%)
− Operating expenses (taxes, insurance, maintenance, management, capex reserve)
= NOI

NOI ÷ purchase price          = cap rate
(NOI − debt service) ÷ cash invested = cash-on-cash return
```

Minnesota-specific inputs that generic calculators miss: property tax rates by
county, winter utility and snow-removal costs, and seasonal vacancy patterns.

## Due diligence checklist areas

Physical condition · title and liens · zoning and permitted use · **permit
history (unpermitted work is a hidden liability)** · rental licensing (Saint Paul
and Minneapolis both require it) · known environmental hazards (lead, asbestos,
radon) · tenant status and lease obligations.

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Properties | `PRP-####` | ⬜ | 9.3 |
| ARV database | — | ⬜ | 9.3 |
| Analysis models | — | ⬜ | 9.3 |
| Due diligence checklists | `CHK-####` | ⬜ | 9.3 |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `13_Estimating` | **Supplies all rehab cost figures** — the core dependency |
| `20_CRM` | Investor clients who consume this analysis |
| `14_Projects` | Acquired properties become projects |
| `21_Finance` | Acquisition financing and returns |
| `07_SaaS` | The Property Analyzer and Rehab Calculator products build on this |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 9.3 | Flip and rental analysis models | ⬜ Triggered by first acquisition or investor engagement |

**Dependency note:** this domain is only as good as `13_Estimating`. Building
analysis models before the cost database exists would produce exactly the guessy
output that Fishbeck's advantage is supposed to replace. **Do not build ahead of
Phase 2.**

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Is Fishbeck acquiring property, serving investors, or both? | Whether models are internal or client-facing |
| — | Target neighborhoods and price bands? | Market data scope |
| — | Financing structure available? | Realistic return modeling |

## Future automation ideas

- Address → automated property intelligence (assessor, permits, tax data).
- Rehab estimate auto-generated from a scope checklist using `ASM` assemblies.
- ARV estimation from comparable sales data.
- Deal screening that ranks a list of candidate properties.
- Feed the existing fix-n-flip calculator in the estimator app from this domain.

## AI usage notes

Never produce an investment analysis with invented rehab costs — pull from
`13_Estimating` or state clearly that the cost basis is unverified. Investment
analysis is **not** financial advice; label outputs as estimates based on stated
assumptions. Always show the assumptions, since they drive the answer more than
the math does.
