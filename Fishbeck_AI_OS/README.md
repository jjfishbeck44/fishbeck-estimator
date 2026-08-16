---
id: OS-0000
title: Fishbeck OS
type: readme
domain: Fishbeck_AI_OS
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-15
review_cycle: quarterly
next_review: 2026-11-15
tags: [governance, index, needs-verification]
source_of_truth: true
ai_usage: read-write
confidence: low
---

# Fishbeck OS

The complete operating system and single source of truth for
**Fishbeck Innovations LLC** — a construction, renovation, and property services
company in Saint Paul, Minnesota.

This is not a folder structure. It is a governed, versioned, machine-readable
system designed to hold every estimate, receipt, invoice, project, employee, SOP,
inspection photo, production rate, vendor, AI prompt, building code, and workflow
the company will ever produce.

## Start here

| If you are… | Read |
|-------------|------|
| An AI assistant starting a session | `_System/08_AI_Operating_Protocol.md` |
| Learning how the OS works | `_System/00_Fishbeck_OS_Charter.md` |
| Looking for where something goes | `_System/01_Architecture_Master.md` |
| Creating a document | `_Templates/README.md` |
| Deciding what to build next | `_System/09_Build_Roadmap.md` |

## Structure

```
_System/       Governance — the standards the OS obeys
_Templates/    Reusable document skeletons
_Registry/     Machine-readable master indexes (CSV)

── Go-to-market ──────────────────────────────────
00_Brand              Identity, messaging, voice
01_Website            Live website content
02_SEO                Keywords, local SEO, competitors
03_Content            Video, social, newsletter engine
04_Case_Studies       Project write-ups and proof
05_Digital_Products   Packs, templates, lead magnets
06_Sales_Marketing    Capability statements, one-pagers
07_SaaS               Future software products

── Intelligence ──────────────────────────────────
08_AI_Agents          Prompts, agents, automation, scripts
09_Knowledge_Base     Narrative reference (migrating)
10_Archive            Deprecated material

── Company operations ────────────────────────────
11_Executive          Strategy, OKRs, KPIs, scorecard
12_Operations         SOP library, scheduling, closeout
13_Estimating         Cost database — the company's brain
14_Projects           Every job, start to archive
15_Construction_Knowledge  MN codes, specs, details
16_Quality            Checklists, defects, lessons learned
17_Purchasing         Vendors, products, pricing history
18_Equipment          Inventory, maintenance, tracking
19_HR                 Hiring, onboarding, training, certs
20_CRM                Leads, clients, partners
21_Finance            Invoices, receipts, job costing
22_Analytics          Measurement and reporting
23_Real_Estate        Rental and flip analysis
24_Legal_Risk         Contracts, insurance, safety
```

## The ten principles

1. **One fact, one home.** Duplication is a defect.
2. **Systems over documents.** Build the template, not the one-off.
3. **Machine-readable first.** CSV with stable IDs; Markdown with front matter.
4. **Every file is addressable.** ID, owner, status, confidence — always.
5. **Dependency order.** Standards → data → process → execution → analytics.
6. **Minnesota code compliant.** Cite the section, every time.
7. **Version controlled.** Git is the audit trail. Deprecate, never delete.
8. **Automation first.** Manual work is technical debt; log it.
9. **Improve before adding.** Extend an existing system first.
10. **Compounding, not rushing.** Correctness outranks speed.

Full text: `_System/00_Fishbeck_OS_Charter.md`.

## The core loop

Everything in this system exists to serve one loop:

```
Estimate → Build → Capture actuals → Compare → Recalibrate → Better estimate
```

A project is not closed until it produces historical costs, lessons learned,
defect patterns, vendor performance, and photos (`DEC-0010`). That gate is what
makes the company measurably better after every single job.

## Rules for anyone — human or AI — working here

- **Never invent a number.** Cite a source ID or mark it `[confirm]`.
- **Never invent an ID.** Take the next one from `_Registry/Entity_ID_Registry.csv`.
- **Never invent a folder.** If nothing in the architecture fits, ask.
- **Never approve your own work.** AI drafts; the owner approves.
- **Never duplicate a fact.** Reference the ID that owns it.

## Current state

| Phase | Status |
|-------|--------|
| 0 — Foundation & Governance | ✅ Complete |
| 1 — Migration & Registry Population | ⬜ Next |
| 2–9 | ⬜ See `_System/09_Build_Roadmap.md` |

Six questions currently block downstream work — see the open questions table in
`_System/Decision_Log.md`.
