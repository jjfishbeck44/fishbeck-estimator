---
id: SYS-0010
title: Build Roadmap
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: monthly
next_review: 2026-08-31
tags: [governance, strategy, automation]
related: [SYS-0001, SYS-0002, SYS-0011]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# Build Roadmap

Dependency-ordered build plan. Each phase's outputs are the next phase's inputs.
**Do not start a phase whose dependencies are incomplete.**

## Phase status

| Phase | Name | Status | Blocks |
|-------|------|--------|--------|
| 0 | Foundation & Governance | ✅ **Complete** (2026-07-31) | Everything |
| 1 | Migration & Registry Population | ⬜ Next | Phases 2–8 |
| 2 | Estimating Core | ⬜ Pending | 3, 5, 7 |
| 3 | Operations & SOP Library | ⬜ Pending | 4, 5 |
| 4 | Project Execution System | ⬜ Pending | 5, 6, 7 |
| 5 | Quality & Feedback Loop | ⬜ Pending | 7 |
| 6 | Commercial Systems (CRM, Finance, Purchasing) | ⬜ Pending | 7 |
| 7 | Analytics & Executive Scorecard | ⬜ Pending | 8 |
| 8 | Automation & AI Layer | ⬜ Pending | — |
| 9 | Growth Domains (HR, Equipment, Real Estate, Legal) | ⬜ Pending | — |

---

## Phase 0 — Foundation & Governance ✅

**Delivered 2026-07-31.**

- `_System/` — Charter, Architecture, Naming, Metadata, Taxonomy, ID Registry,
  Version Control, Lifecycle, AI Protocol, Roadmap, Migration Map, Decision Log
- `_Templates/` — 13 reusable document templates
- `_Registry/` — Document, Entity ID, KPI, and Automation registries
- Domain scaffolds with governed READMEs for `11`–`24`

---

## Phase 1 — Migration & Registry Population

**Depends on:** Phase 0
**Goal:** Every existing file is registered, addressable, and in its correct home.

| # | Deliverable | Priority |
|---|-------------|----------|
| 1.1 | Execute `SYS-0011` migration: move KB data into `13_Estimating`, `15_Construction_Knowledge`, `12_Operations` | 10 |
| 1.2 | Backfill front matter on all 117 legacy files | 9 |
| 1.3 | Populate `_Registry/Document_Registry.csv` from front matter | 9 |
| 1.4 | Reconcile `lib/prompt.js` pricing against `13_Estimating` as consumer | 8 |
| 1.5 | Write `validate-metadata.js` + wire into `npm test` | 7 |

**Exit criteria:** Zero files without front matter. Zero duplicated facts. Every
document in the registry.

---

## Phase 2 — Estimating Core

**Depends on:** 1.1, 1.4
**Goal:** Estimates are assembled from a real database, not from memory.

| # | Deliverable | Priority |
|---|-------------|----------|
| 2.1 | `Material_Database.csv` — MAT-####, real Twin Cities supplier pricing | 10 |
| 2.2 | `Labor_Database.csv` — LAB-####, burdened crew rates | 10 |
| 2.3 | `Production_Rates.csv` — expand PRD-#### beyond the 4 template rows | 9 |
| 2.4 | `Assemblies.csv` — ASM-#### composite units (e.g. "hang+finish+prime drywall/sf") | 10 |
| 2.5 | `Unit_Pricing.csv` — UP-#### client-facing ranges derived from assemblies | 9 |
| 2.6 | `Historical_Costs.csv` schema — HC-#####, the feedback loop target | 9 |
| 2.7 | Estimate template + markup/overhead/margin standard | 8 |

**Exit criteria:** A rental turn can be estimated line-by-line from assemblies
with every number traceable to a MAT/LAB/PRD row.

---

## Phase 3 — Operations & SOP Library

**Depends on:** Phase 0, 2.4
**Goal:** The work is repeatable without Jimmy in the room.

| # | Deliverable | Priority |
|---|-------------|----------|
| 3.1 | SOP-0001 Rental Turn (highest-volume service) | 10 |
| 3.2 | SOP-0002 Property Assessment walkthrough | 9 |
| 3.3 | SOP-0003 Change Order process | 9 |
| 3.4 | SOP-0004 Client Communication cadence | 8 |
| 3.5 | SOP-0005 Jobsite setup, safety, cleanup | 8 |
| 3.6 | SOP-0006 Project Closeout (enforces the 5 closeout artifacts) | 10 |
| 3.7 | Scheduling system + crew capacity model | 7 |

---

## Phase 4 — Project Execution System

**Depends on:** Phase 2, Phase 3
**Goal:** Every job produces structured data as a byproduct of doing the work.

| # | Deliverable | Priority |
|---|-------------|----------|
| 4.1 | Project folder generator + charter template | 9 |
| 4.2 | Daily report system | 8 |
| 4.3 | Change order / RFI / submittal workflow | 8 |
| 4.4 | Punch list system | 8 |
| 4.5 | Photo capture and cataloguing standard in practice | 7 |
| 4.6 | Closeout package template | 9 |

---

## Phase 5 — Quality & Feedback Loop

**Depends on:** 2.6, 4.6
**Goal:** The company gets measurably better every job. **This is the core loop.**

| # | Deliverable | Priority |
|---|-------------|----------|
| 5.1 | Historical cost capture procedure (actuals → HC rows) | 10 |
| 5.2 | Estimate accuracy scoring (estimated vs. actual by trade) | 10 |
| 5.3 | QC checklists by trade | 8 |
| 5.4 | Defect library seeded from real callbacks | 8 |
| 5.5 | Lessons learned + root cause templates in use | 7 |

---

## Phase 6 — Commercial Systems

**Depends on:** Phase 0, Phase 4

| # | Deliverable | Priority |
|---|-------------|----------|
| 6.1 | CRM schema + pipeline stages | 8 |
| 6.2 | Vendor database + performance scoring | 8 |
| 6.3 | Job costing / invoice / receipt schema | 9 |
| 6.4 | Cash flow and AR tracking | 7 |
| 6.5 | Preferred products and lead-time database | 6 |

---

## Phase 7 — Analytics & Executive Scorecard

**Depends on:** Phases 2, 5, 6

| # | Deliverable | Priority |
|---|-------------|----------|
| 7.1 | KPI definitions populated in `_Registry/KPI_Registry.csv` | 8 |
| 7.2 | Company scorecard | 8 |
| 7.3 | Quarterly OKR system | 7 |
| 7.4 | Business plan + strategic plan | 7 |
| 7.5 | Margin, labor efficiency, vendor performance reporting | 7 |

---

## Phase 8 — Automation & AI Layer

**Depends on:** Phases 1–7 (automation needs data to act on)

| # | Deliverable | Priority |
|---|-------------|----------|
| 8.1 | Prompt library (PMT-####) | 8 |
| 8.2 | Metadata + ID validation in CI | 8 |
| 8.3 | Receipt OCR → `21_Finance` rows | 7 |
| 8.4 | Estimator app reads `13_Estimating` CSVs directly | 9 |
| 8.5 | MCP server / embedding index over the OS | 6 |
| 8.6 | Agent definitions (AGT-###) for estimating, ops, content | 7 |

---

## Phase 9 — Growth Domains

**Depends on:** business need, not technical dependency. Build when the need is real.

| # | Deliverable | Trigger |
|---|-------------|---------|
| 9.1 | HR: handbook, onboarding, training | First W-2 hire |
| 9.2 | Equipment: inventory + QR tracking | >$10k of tools |
| 9.3 | Real Estate: flip/rental analysis models | First acquisition |
| 9.4 | Legal & Risk: contracts, insurance, lien waivers | Now — risk exists today |

> **Note:** 9.4 is dependency-free and risk-reducing. Consider pulling it forward
> ahead of its phase number.

---

## Sequencing principle

The build order maximizes compounding: **standards → cost data → repeatable
process → execution → feedback → measurement → automation.** Each phase makes the
next cheaper. Building automation (Phase 8) before data (Phase 2) would automate
guesswork.

## Future automation ideas

- Auto-update phase status from registry completeness metrics.
- Burn-up chart of documents-by-domain over time.

## AI usage notes

Update phase status when a phase completes. Recommend the next deliverable from
the earliest incomplete phase whose dependencies are met — never skip ahead
because a later task looks more interesting.
