---
id: CK-0000
title: 15_Construction_Knowledge — Technical Authority
type: readme
domain: 15_Construction_Knowledge
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [code-compliance, minnesota, reference, inspection]
related: [SYS-0002, SYS-0006]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# 15_Construction_Knowledge — Technical Authority

## Purpose

What the code requires, what the manufacturer specifies, and how the detail is
actually built. This domain answers "is this right?" — as distinct from
`12_Operations`, which answers "how do we do it?"

## Scope

| In scope | Out of scope |
|----------|--------------|
| Minnesota building, residential, energy, electrical, plumbing, mechanical codes | Fishbeck's own procedures → `12_Operations` |
| Permitting requirements by jurisdiction | Verification checklists → `16_Quality` |
| Manufacturer specs and installation instructions | Product pricing → `13_Estimating` |
| Typical details and assemblies (technical) | Vendor sourcing → `17_Purchasing` |
| Inspection standards and what inspectors look for | |

## Source of truth

**Authoritative for:** code requirements, technical standards, permit triggers.
**Defers to:** the actual published code and the AHJ (authority having
jurisdiction). This domain is a *navigable index* of the code, never a
replacement for it.

## The single most important rule

**Every code claim cites its section, edition, and jurisdiction.**

> R703.1 (2020 MN Residential Code) — exterior wall covering must provide
> weather protection…

An uncited code claim is worse than no answer: it sounds authoritative and can
fail an inspection or create liability.

## Structure

```
15_Construction_Knowledge/
├── README.md
├── Minnesota_Codes/        CODE-#### — code references by system
├── Permitting_Matrix.md    What needs a permit, by jurisdiction
├── Manufacturer_Specs/     SPEC-####
├── Installation_Guides/
├── Typical_Details/        DTL-####
├── Building_Systems/       How systems work (envelope, HVAC, structure)
├── Best_Practices/         Cold-climate and Minnesota-specific practice
└── Inspection_Standards/   What inspectors check, by inspection type
```

## Minnesota context — why this domain is non-negotiable

Minnesota's climate and code environment create requirements that generic
national guidance gets wrong:

| Topic | Minnesota specificity |
|-------|----------------------|
| Frost depth | Footings must extend below frost line (varies ~42–60" by jurisdiction) |
| Energy code | MN has adopted amendments beyond the base IECC |
| Ice dams | Roof/attic ventilation and eave protection requirements |
| Vapor retarders | Cold-climate assembly rules — wrong side of the wall is a mold claim |
| Radon | New construction radon control requirements |
| Winter concrete | Cold-weather placement and curing protection |
| Lead-safe (pre-1978) | RRP rule applies to most Saint Paul housing stock |

Each becomes a `CODE-####` or `Best_Practices` entry with citations.

## Jurisdictions covered

Saint Paul · Minneapolis · Ramsey County · Hennepin County · Washington County ·
Dakota County · Anoka County — plus suburbs served. Permit requirements and fees
vary by city; the permitting matrix is organized by jurisdiction for this reason.

## Contents

| Item | ID prefix | Status | Phase |
|------|-----------|--------|-------|
| Code references | `CODE-####` | ⬜ | migrating from legacy KB |
| Permitting matrix | — | ◐ legacy file exists | 1.1 |
| Manufacturer specs | `SPEC-####` | ⬜ | as products are used |
| Typical details | `DTL-####` | ⬜ | as details recur |
| Inspection standards | — | ⬜ | after 3+ inspections observed |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `12_Operations` | SOPs must satisfy the requirements documented here |
| `16_Quality` | Checklists verify compliance with these standards |
| `13_Estimating` | Code requirements drive scope, and therefore cost |
| `24_Legal_Risk` | Code compliance is the foundation of liability defense |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1.1 | Absorb legacy `09_KB/Minnesota_Codes`, `Permitting_Matrix`, `Building_Systems` | ⬜ |
| — | Code references for the trades Fishbeck self-performs | ⬜ |
| — | Permitting matrix expanded per jurisdiction | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|
| — | Which MN code editions are currently adopted in each jurisdiction? | Every `CODE-####` citation |
| — | Which trades does Fishbeck self-perform vs. sub out? | Prioritizing which codes to document |

## Future automation ideas

- Permit requirement lookup by address + scope.
- Code citation validator confirming section numbers exist in the cited edition.
- Alert when Minnesota adopts a new code edition — every citation needs review.
- Link `CODE-####` entries to the checklist items that verify them.

## AI usage notes

**Never state a code requirement without a citation, and never guess a section
number.** If the requirement isn't documented here, say so and point to the
jurisdiction's building department. Code content is `confidence: high` only when
verified against published text — inferred requirements are `low` at best. When
a project is pre-1978, always raise lead-safe RRP requirements unprompted.
