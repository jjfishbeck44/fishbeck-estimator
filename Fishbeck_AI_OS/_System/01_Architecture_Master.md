---
id: SYS-0002
title: Architecture Master
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [governance, architecture, folder-structure]
related: [SYS-0001, SYS-0004, SYS-0011]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Architecture Master

The authoritative folder architecture for Fishbeck OS. **No top-level domain may
be created, renamed, or renumbered without amending this file.**

## Design rules

- Top-level domains are numbered `NN_Domain_Name`. Numbers are permanent — a
  retired domain keeps its number and is marked deprecated. Never renumber.
- Underscore-prefixed folders (`_System`, `_Templates`, `_Registry`) are
  infrastructure and sort above all domains.
- Depth limit: **four levels** below the OS root. Deeper nesting means the
  taxonomy is wrong.
- Every folder has a `README.md` declaring purpose, scope, owner, and naming.

## Root structure

```
Fishbeck_AI_OS/
├── _System/                   Governance — how the OS itself works
├── _Templates/                Reusable document templates (TPL-*)
├── _Registry/                 Machine-readable master indexes (CSV)
│
│   ── GO-TO-MARKET ──────────────────────────────────────────────
├── 00_Brand/                  Identity, messaging, voice
├── 01_Website/                Live website content
├── 02_SEO/                    Keywords, local SEO, competitors
├── 03_Content/                Content engine — video, social, newsletter
├── 04_Case_Studies/           Project write-ups and proof
├── 05_Digital_Products/       Packs, templates, lead magnets
├── 06_Sales_Marketing/        Capability statements, one-pagers, outreach
├── 07_SaaS/                   Future software products
│
│   ── INTELLIGENCE ──────────────────────────────────────────────
├── 08_AI_Agents/              Prompt library, agents, automations, scripts
├── 09_Knowledge_Base/         Narrative reference layer (see Migration Map)
├── 10_Archive/                Deprecated material, kept for reference
│
│   ── COMPANY OPERATIONS ────────────────────────────────────────
├── 11_Executive/              Business plan, strategy, OKRs, KPIs, scorecard
├── 12_Operations/             SOP library, scheduling, closeout, change orders
├── 13_Estimating/             Cost database, production rates, assemblies
├── 14_Projects/               Active and completed jobs, the transaction record
├── 15_Construction_Knowledge/ MN codes, specs, details, inspection standards
├── 16_Quality/                QC checklists, defects, lessons learned, RCA
├── 17_Purchasing/             Vendors, preferred products, pricing history
├── 18_Equipment/              Inventory, QR tracking, maintenance, calibration
├── 19_HR/                     Hiring, onboarding, training, handbook, certs
├── 20_CRM/                    Leads, clients, investors, PMs, realtors, partners
├── 21_Finance/                Invoices, receipts, budgets, job costing, taxes
├── 22_Analytics/              Revenue, margin, estimate accuracy, efficiency
├── 23_Real_Estate/            Rental analysis, flips, ARV, due diligence
└── 24_Legal_Risk/             Contracts, insurance, licensing, safety, liens
```

## Domain register

| # | Domain | Purpose | Owner | Primary artifact | Status |
|---|--------|---------|-------|------------------|--------|
| _System | Governance | Standards the OS obeys | Jimmy | Standards | **Built** |
| _Templates | Templates | Reusable document skeletons | Jimmy | TPL-* files | **Built** |
| _Registry | Registries | Master machine-readable indexes | AI steward | CSV | **Built** |
| 00 | Brand | Identity, voice, messaging | Jimmy | Markdown | Built |
| 01 | Website | Live site content | Jimmy | Markdown | Built |
| 02 | SEO | Search strategy | Jimmy | CSV + Markdown | Built |
| 03 | Content | Content production engine | Jimmy | Markdown | Built |
| 04 | Case Studies | Proof and content raw material | Jimmy | Markdown | Built |
| 05 | Digital Products | Sellable/lead-magnet packs | Jimmy | Markdown | Scaffold |
| 06 | Sales & Marketing | Outbound assets | Jimmy | Markdown | Built |
| 07 | SaaS | Software product docs | Jimmy | PRDs | Scaffold |
| 08 | AI | Prompts, agents, automation, scripts | Jimmy | Prompts + code | Partial |
| 09 | Knowledge Base | Narrative reference | Jimmy | Markdown | Migrating |
| 10 | Archive | Deprecated material | Jimmy | Any | Built |
| 11 | Executive | Strategy and performance | Jimmy | Markdown + CSV | Scaffold |
| 12 | Operations | How work gets done | Jimmy | SOPs | Scaffold |
| 13 | Estimating | Cost intelligence | Jimmy | CSV | Scaffold |
| 14 | Projects | Job record of truth | Jimmy | Project folders | Scaffold |
| 15 | Construction Knowledge | Technical authority | Jimmy | Markdown | Scaffold |
| 16 | Quality | Defect prevention | Jimmy | Checklists + CSV | Scaffold |
| 17 | Purchasing | Vendor and buying intelligence | Jimmy | CSV | Scaffold |
| 18 | Equipment | Asset management | Jimmy | CSV | Scaffold |
| 19 | HR | People systems | Jimmy | Markdown | Scaffold |
| 20 | CRM | Relationship record | Jimmy | CSV | Scaffold |
| 21 | Finance | Money record | Jimmy | CSV | Scaffold |
| 22 | Analytics | Measurement | Jimmy | CSV + Markdown | Scaffold |
| 23 | Real Estate | Investment analysis | Jimmy | CSV + Markdown | Scaffold |
| 24 | Legal & Risk | Contracts, insurance, safety | Jimmy | Markdown | Scaffold |

**Status values:** `Built` (has real content) · `Partial` (some content) ·
`Scaffold` (README + structure only) · `Migrating` (contents moving per SYS-0011).

## Source-of-truth assignments

Conflicts are resolved in favor of the domain listed here. This table is the
tie-breaker whenever two files disagree.

| Fact type | Authoritative location |
|-----------|------------------------|
| Company identity, mission, values | `00_Brand` |
| Service descriptions and positioning | `00_Brand/Service_Descriptions.md` |
| Unit pricing and cost ranges | `13_Estimating/Unit_Pricing/` |
| Labor production rates | `13_Estimating/Production_Rates/` |
| Material costs | `13_Estimating/Material_Database/` |
| What a project actually cost | `14_Projects/` → rolled up to `13_Estimating/Historical_Costs/` |
| How work is performed | `12_Operations/SOP_Library/` |
| Code requirements | `15_Construction_Knowledge/Minnesota_Codes/` |
| Vendor terms, lead times, discounts | `17_Purchasing/Vendor_Database/` |
| Who a client is | `20_CRM/` |
| What was invoiced and paid | `21_Finance/` |
| Company targets and KPI definitions | `11_Executive/` + `_Registry/KPI_Registry.csv` |
| Any ID's meaning | `_Registry/Entity_ID_Registry.csv` |

**The estimator app** (`lib/prompt.js`) is a *consumer*, never a source. Its
pricing must be regenerated from `13_Estimating`, not edited independently.

## Cross-domain data flow

```
20_CRM (lead)
   └→ 13_Estimating (estimate built from unit pricing + production rates)
        └→ 14_Projects (job executed, daily reports, change orders, photos)
             ├→ 21_Finance (invoices, receipts, job cost actuals)
             ├→ 16_Quality (punch list, defects, lessons learned)
             ├→ 17_Purchasing (PO history, vendor performance)
             └→ 13_Estimating/Historical_Costs  ← THE FEEDBACK LOOP
                  └→ 22_Analytics (estimate accuracy, margin, efficiency)
                       └→ 11_Executive (scorecard, OKRs)
                            └→ 04_Case_Studies → 03_Content → 20_CRM (new leads)
```

The **feedback loop** is the point of the entire system: actual project costs
must flow back into the estimating database so estimates improve every job.

## Standard subfolder pattern

Domains holding structured data use this shape:

```
NN_Domain/
├── README.md              Purpose, scope, owner, naming, automation
├── _Data/                 CSV databases (the machine-readable truth)
├── _Templates/            Domain-specific templates (if any)
├── Subject_Area_A/
└── Subject_Area_B/
```

## Amendment log

| Date | Version | Change | Approver |
|------|---------|--------|----------|
| 2026-07-31 | 1.0.0 | Initial architecture ratified; domains 11–24 established alongside existing 00–10 | Jimmy Fishbeck |

## Future automation ideas

- Script that verifies the on-disk tree matches this file and fails CI on drift.
- Auto-generated architecture diagram from this table.
- Folder scaffolding generator: `new-domain.js` emits README + `_Data` + template.

## AI usage notes

Before creating any file, locate its domain here. If no domain fits, **stop and
ask** — do not invent a folder. If two domains could hold a fact, the
source-of-truth table decides.
