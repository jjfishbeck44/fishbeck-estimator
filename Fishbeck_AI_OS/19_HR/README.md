---
id: HR-0000
title: 19_HR — People Systems
type: readme
domain: 19_HR
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [hr, hiring, training, policy]
related: [SYS-0002, TPL-POLICY]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 19_HR — People Systems

## Purpose

Hire well, onboard fast, train consistently, and stay compliant. The constraint
on a growing contractor is almost never demand — it's finding and keeping people
who do the work right.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Hiring, onboarding, training | Subcontractor compliance → `17_Purchasing` |
| Employee handbook and policies | Subcontractor agreements → `24_Legal_Risk` |
| Performance reviews and certifications | Payroll processing → `21_Finance` |
| Labor capacity planning | Labor *rates for estimating* → `13_Estimating` |

**Employee vs. subcontractor** is the defining distinction. W-2 employees live
here; 1099 subs live in `17_Purchasing`. Misclassification carries real
Minnesota penalties — when it's ambiguous, get professional advice.

## Source of truth

**Authoritative for:** who works for Fishbeck, their certifications, employment
policy.
**Defers to:** `21_Finance` for compensation paid, `13_Estimating` for the
burdened rates used in estimates.

## Structure

```
19_HR/
├── README.md
├── _Data/
│   └── Employee_Directory.csv    EMP-####
├── Hiring/                       Job descriptions, interview guides
├── Onboarding/                   Day-one through week-one
├── Training/                     Skill matrix and training paths
├── Handbook/                     Employee handbook
├── Policies/                     POL-####
├── Performance/                  Review process and records
└── Certifications/               Licenses, OSHA, lead-safe RRP
```

## Certification tracking

Construction certifications expire, and lapses stop work:

| Certification | Applies to | Renewal |
|---------------|-----------|---------|
| MN contractor license | Company | Annual |
| Lead-safe RRP (EPA) | Anyone disturbing pre-1978 paint | 5 years |
| OSHA 10 / 30 | Field crew | Recommended refresh |
| Trade licenses (electrical, plumbing) | Licensed trades | Varies |
| First aid / CPR | At least one person per crew | 2 years |

Expiry dates go in front matter `expires` for `AUT-009` alerting. Most of Saint
Paul's housing stock is pre-1978, which makes RRP certification effectively
mandatory rather than optional.

## Onboarding target

A new hire should be productive on day one and independent by week two:

| Stage | Content |
|-------|---------|
| Before day 1 | Paperwork, PPE issued, tool list, `EMP-####` created |
| Day 1 | Handbook, safety, jobsite conduct, `SOP-0005` |
| Week 1 | Shadow a rental turn (`SOP-0001`), quality standards |
| Week 2–4 | Independent work with checklist verification |
| Day 90 | First performance review |

Onboarding pulls directly from `12_Operations` SOPs — no separate training
content to maintain, which is the point of a systems-based OS.

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Employee directory | `EMP-####` | ⬜ | 9.1 |
| Handbook | — | ⬜ | 9.1 |
| Policies | `POL-####` | ⬜ | 9.1 |
| Skill matrix | — | ⬜ | 9.1 |
| Certifications | — | ⬜ | **Now** — company license and RRP already apply |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `12_Operations` | SOPs are the training curriculum |
| `14_Projects` | Crew assignment and hours worked |
| `21_Finance` | Payroll and labor cost |
| `24_Legal_Risk` | Employment law, safety compliance, workers' comp |
| `13_Estimating` | Crew capability determines what can be self-performed |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| — | Certification tracking (company-level) | ⬜ **Applies today** |
| 9.1 | Handbook, onboarding, policies | ⬜ Triggered by first W-2 hire |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| Q4 (SYS-0012) | Are there W-2 employees, or 1099 subs only? | Whether Phase 9.1 triggers at all |
| — | Is lead-safe RRP certification current? | Legal ability to work pre-1978 housing |

## Future automation ideas

- Certification expiry alerting (`AUT-009`).
- Onboarding checklist auto-generated from role.
- Skill matrix driving crew assignment recommendations.
- Training completion tracked against SOP versions — when an SOP changes
  materially, everyone trained on the old version needs a refresher.

## AI usage notes

Mark HR records containing personal information `ai_usage: human-only`. Draft
employment policy as `status: draft`, `confidence: low`, and always flag that
Minnesota employment law and worker classification need professional review
before a policy takes effect. Never advise on classification questions directly.
