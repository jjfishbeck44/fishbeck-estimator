---
id: CRM-0000
title: 20_CRM — Relationship Record
type: readme
domain: 20_CRM
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: monthly
next_review: 2026-08-31
tags: [crm, sales, database, marketing]
related: [SYS-0002, SYS-0006]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 20_CRM — Relationship Record

## Purpose

Every person and organization Fishbeck does business with, and the state of that
relationship. For a contractor, repeat clients and referrals are the cheapest
revenue there is — this domain is what makes them systematic instead of lucky.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Leads, clients, investors, property managers, realtors, referral partners | Vendors and subs → `17_Purchasing` |
| Pipeline stages and conversion tracking | Estimates → `13_Estimating` |
| Communication history and preferences | Project execution → `14_Projects` |
| Referral source attribution | Marketing content → `03_Content`, `06_Sales_Marketing` |

## Source of truth

**Authoritative for:** who the client is, contact details, relationship state,
attribution.
**Defers to:** `14_Projects` for what was built, `21_Finance` for what was paid.

## Structure

```
20_CRM/
├── README.md
├── _Data/
│   ├── Leads.csv          LED-####
│   ├── Clients.csv        CLI-####
│   └── Partners.csv       PTR-####
├── Leads/
├── Clients/
├── Property_Managers/
├── Investors/
├── Realtors/
└── Referral_Partners/
```

## Pipeline stages

```
LED-####                                        CLI-####
inquiry → qualified → assessed → estimated → proposed → won → client
                                                  ↓
                                                 lost
```

| Stage | Definition | Exit criteria |
|-------|-----------|---------------|
| `inquiry` | Contact made, nothing qualified | Response received |
| `qualified` | Scope, budget, timeline, and location fit | Assessment scheduled |
| `assessed` | Property walked (`SOP-0002`) | Scope defined |
| `estimated` | `EST-####` produced | Estimate delivered |
| `proposed` | Formal proposal delivered | Client decision |
| `won` | Contract signed | Becomes `CLI-####` + `PRJ-####` |
| `lost` | Declined | **Loss reason recorded — always** |

**Loss reasons** use a closed set so they can be analyzed: `price` ·
`timeline` · `scope-fit` · `no-response` · `competitor` · `project-cancelled` ·
`out-of-area`. Losing on price consistently means the pricing is wrong or the
positioning is; you can't tell which without this data.

## Client segments

Fishbeck's segments have genuinely different buying behavior:

| Segment | Volume | Decision driver | Relationship value |
|---------|--------|-----------------|--------------------|
| Property managers | High, recurring | Speed, reliability, predictable pricing | **Highest** — one relationship, many jobs |
| Investors / flippers | Medium, recurring | ROI, schedule certainty | High |
| Homeowners | Low, one-time | Trust, communication, craftsmanship | Referral value |
| Realtors | Referral source | Making their deals close | Multiplier |
| Commercial | Future | Qualification, bonding | Growth target |

Recurring-relationship segments justify far more nurture investment than
one-time segments. The CRM should make that difference visible.

## Required fields

| Field | Purpose |
|-------|---------|
| `source` | How they found Fishbeck — attribution for marketing spend |
| `segment` | Drives communication cadence |
| `referred_by` | `PTR-####` or `CLI-####` — enables referral tracking |
| `first_contact`, `last_contact` | Nurture timing |
| `lifetime_value` | Sum of project values; identifies who matters |

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Leads | `LED-####` | ⬜ | 6.1 |
| Clients | `CLI-####` | ⬜ | 6.1 |
| Referral partners | `PTR-####` | ⬜ | 6.1 |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `13_Estimating` | Leads become estimates |
| `14_Projects` | Won leads become projects |
| `21_Finance` | Client payment history and creditworthiness |
| `04_Case_Studies` | Satisfied clients become proof |
| `06_Sales_Marketing` | Consumes segment data for targeting |
| `02_SEO` / `03_Content` | Attribution closes the loop on content ROI |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 6.1 | CRM schema + pipeline stages | ⬜ |
| 6.1 | Lead intake process | ⬜ |
| — | Attribution wired to the estimator app's existing lead flow | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Is there an existing CRM tool in use, or is this greenfield? | Whether this is the system or a mirror |
| — | Current lead volume and sources? | `KPI-009` baseline |

## Future automation ideas

- Estimator app submissions auto-create `LED-####` records.
- Automatic nurture reminders by segment cadence.
- Referral attribution reporting — which partners actually produce.
- Lifetime value calculated from `21_Finance` totals.
- Win/loss analysis by loss reason to find pricing and positioning problems.

## AI usage notes

Client contact details are personal information — never include them in
generated marketing content, case studies, or anything external without explicit
permission. Case studies reference the property, not the person, unless the
client has agreed to be named.
