---
id: LEG-0000
title: 24_Legal_Risk — Contracts, Insurance, and Risk
type: readme
domain: 24_Legal_Risk
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [legal, insurance, safety, policy]
related: [SYS-0002, DEC-0002, TPL-POLICY]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# 24_Legal_Risk — Contracts, Insurance, and Risk

## Purpose

Keep the company licensed, insured, contracted, and safe. Established per
`DEC-0002` — the original domain list had no home for the obligations that can
end a contracting business overnight.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Contract templates and executed agreements | Project records → `14_Projects` |
| Insurance policies and certificates | Sub compliance *tracking* → `17_Purchasing` |
| Licensing and registration | Employment policy → `19_HR` |
| Lien waivers and mechanic's lien process | Code requirements → `15_Construction_Knowledge` |
| Safety program and incident records | |
| Warranty terms and dispute records | |

## Source of truth

**Authoritative for:** contract language, insurance coverage, licensing status,
legal obligations.
**Defers to:** actual legal counsel. This domain **organizes** legal documents;
it does not produce legal advice.

## Priority note — this domain is not really Phase 9

It sits at number 24 for architectural reasons, but the underlying risks exist
**today**, on the current job, whether or not the documentation does:

| Risk | Consequence if unaddressed |
|------|---------------------------|
| Lapsed general liability insurance | One claim ends the company |
| Uninsured subcontractor on site | Their injury becomes Fishbeck's liability |
| No written contract | No enforceable payment terms; no scope defense |
| Missed lien deadline | Loss of the right to collect entirely |
| Unlicensed work | Fines, and unenforceable contracts |
| No lead-safe RRP on pre-1978 work | Federal penalties per violation |

**Recommendation:** pull the compliance audit forward ahead of its phase number.
It is dependency-free and it is the highest-consequence gap in the OS.

## Structure

```
24_Legal_Risk/
├── README.md
├── Contracts/          CON-#### executed agreements
├── Templates/          Contract templates (attorney-reviewed)
├── Insurance/          Policies, certificates, expiry tracking
├── Licensing/          MN contractor license, registrations
├── Lien_Waivers/       Process and executed waivers
├── Safety/             Program, toolbox talks, incident records
└── Disputes/           Records of any claim or dispute
```

## Minnesota-specific obligations

| Item | Why it matters |
|------|----------------|
| MN residential building contractor license | Required for most residential work; annual renewal |
| Mechanic's lien deadlines | Minnesota has **strict statutory deadlines** — missing one forfeits the right to lien entirely |
| Pre-lien notice | Required in specific circumstances; timing is unforgiving |
| Home improvement contract requirements | MN statute sets required contract terms for residential work |
| Lead-safe RRP | Applies to most pre-1978 housing — the bulk of Saint Paul's stock |
| Workers' comp | Required with employees; sub coverage must be verified |

**Every item above needs verification against current Minnesota statute by a
licensed attorney.** Lien deadlines in particular are a place where "roughly
right" is worthless.

## Contract templates needed

| Template | Purpose | Priority |
|----------|---------|----------|
| Residential construction agreement | Standard client contract | **High** |
| Subcontractor agreement | Sub scope, insurance, payment, lien waiver | **High** |
| Change order form | Already templated (`TPL_Change_Order.md`) | ✅ |
| Lien waiver (partial / final) | Payment protection | High |
| Consulting / owner-rep agreement | Non-construction services | Medium |
| Property assessment agreement | Scope and liability limits | Medium |

All contract templates require attorney review before use. AI drafts are
starting points for that review, never final documents.

## Insurance tracking

| Policy | Carrier | Coverage | Expires | Certificate |
|--------|---------|----------|---------|-------------|
| General liability | | | | |
| Workers' compensation | | | | |
| Commercial auto | | | | |
| Tools & equipment | | | | |
| Professional liability | | | | |

Expiry dates go in front matter `expires` for `AUT-009`. **A lapse discovered
after a claim is unrecoverable.**

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Contracts | `CON-####` | ⬜ | 9.4 |
| Policies | `POL-####` | ⬜ | 9.4 |
| Insurance register | — | ⬜ | **Now** |
| Safety program | — | ⬜ | 9.4 |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `17_Purchasing` | Sub agreements and insurance verification |
| `14_Projects` | Contracts and lien waivers tie to projects |
| `21_Finance` | Payment terms and lien timing follow payment records |
| `19_HR` | Employment law, workers' comp, safety training |
| `15_Construction_Knowledge` | Code compliance underpins liability defense |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| — | **Compliance audit** (license, insurance, sub certs current?) | ⬜ **Do now** |
| 9.4 | Contract templates (attorney-reviewed) | ⬜ |
| 9.4 | Lien waiver process | ⬜ |
| 9.4 | Safety program | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Is the MN contractor license current? | Legal ability to contract |
| — | What insurance is in force, and when does it expire? | Risk exposure right now |
| — | Is there a written contract in use today? | Payment and scope enforceability |
| — | Are current sub insurance certificates on file? | Liability transfer |

## Future automation ideas

- `AUT-009` expiry alerting at 60 / 30 / 7 days for every policy and license.
- Lien deadline calculator from first-work and last-work dates.
- Contract generation from project scope with attorney-approved clause library.
- Sub compliance dashboard — nobody schedules without a green light.

## AI usage notes

**Never draft final legal language.** Draft as `status: draft`,
`confidence: low`, and state plainly that Minnesota-licensed attorney review is
required before use. Never advise on lien deadlines, worker classification, or
insurance adequacy — organize the documents and flag the questions for a
professional. When a project involves pre-1978 housing, raise lead-safe RRP
requirements unprompted.
