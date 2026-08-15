---
id: SYS-0012
title: Decision Log
type: index
domain: _System
status: approved
version: 1.2.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-08-12
review_cycle: as-needed
next_review: 2026-12-31
tags: [governance, standard, decision]
related: [SYS-0001, SYS-0002]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# Decision Log

Structural decisions about the OS itself. Per `SYS-0001`, any new top-level
domain, new ID prefix, changed CSV schema, or changed metadata field requires an
entry here.

Individual decision records that need full context use `TPL_Decision_Record.md`
and are filed as `DEC-####_<Short-Title>.md` in this folder. Small decisions
live directly in the table below.

## Decisions

| ID | Date | Decision | Rationale | Alternatives rejected | Approver |
|----|------|----------|-----------|----------------------|----------|
| DEC-0001 | 2026-07-31 | Keep existing domains `00`–`10` and add `11`–`24` rather than renumbering into a clean scheme | Renumbering breaks every inbound link across 117 files for cosmetic gain | Full renumber; parallel OS in a new folder | Jimmy Fishbeck |
| DEC-0002 | 2026-07-31 | Add `21_Finance` and `24_Legal_Risk`, which were not in the original domain list | "Every receipt and invoice" implies a finance domain; construction carries contract, insurance, lien, and safety obligations that need a home | Folding finance into `22_Analytics`; leaving legal undomained | Jimmy Fishbeck |
| DEC-0003 | 2026-07-31 | Map "Marketing" to existing `00_Brand` + `03_Content` + `06_Sales_Marketing` rather than creating a new Marketing domain | Charter principle #1 (one fact, one home) and #9 (improve before adding) | New `Marketing` domain | Jimmy Fishbeck |
| DEC-0004 | 2026-07-31 | Extend `08_AI_Agents` with `Prompt_Library`, `Automation`, `Scripts`, `APIs` instead of a new AI domain | Same as DEC-0003; the folder already holds agent definitions | New `AI` domain at `25` | Jimmy Fishbeck |
| DEC-0005 | 2026-07-31 | Versions live in front matter and git only — never in filenames | Filename versions produce `Final_v3_FINAL.md`; git already versions | `_v2` suffix convention | Jimmy Fishbeck |
| DEC-0006 | 2026-07-31 | CSV rows are never edited in place; superseded rows are deprecated and replaced with `effective_date` | Past estimates must remain reproducible for accuracy scoring | In-place edits with git history as the only record | Jimmy Fishbeck |
| DEC-0007 | 2026-07-31 | `13_Estimating` is the single source of pricing truth; `lib/prompt.js`, `public/js/calculators/pricing.js` and `lib/workOrderPrompt.js` become generated consumers | Multiple files hold pricing and can disagree about what a job costs. **Confirmed live 2026-08-12:** `lib/workOrderPrompt.js` (added on master after this decision) prices LVP at $2.50–4.50/sqft while `MAT-0001` says $1.80–3.50/sqft — a ~40% gap on the low end, in the same repository | Keeping app pricing independent | Jimmy Fishbeck |
| DEC-0008 | 2026-07-31 | Multi-value CSV columns use pipe delimiters | Commas break CSV parsing without quoting; pipes are unambiguous | Quoted comma lists; JSON in cells | Jimmy Fishbeck |
| DEC-0009 | 2026-07-31 | OS stays inside `fishbeck-estimator` for now; split to a dedicated repo at ~500 files | Current volume doesn't justify the split cost; architecture is repo-agnostic | Immediate split; permanent co-location | Jimmy Fishbeck |
| DEC-0010 | 2026-07-31 | A project is not "closed" until it emits 5 artifacts: historical costs, lessons learned, defects, vendor performance, photos | This feedback loop is the mechanism by which the company compounds | Optional closeout reporting | Jimmy Fishbeck |
| DEC-0011 | 2026-08-06 | The pricing gate keys on `confidence`, not `status`. `status` = row currency; `confidence` = clearance to quote. Only `confidence: high` is client-quotable | As written, the gate would have forced 40 real migrated pricing rows to `inactive`, misusing a currency field as a trust field and making the database look empty. The two questions are genuinely different | Marking all migrated rows `inactive`; leaving the conflict unresolved | Jimmy Fishbeck |
| DEC-0012 | 2026-08-06 | Retire `09_Knowledge_Base` entirely; its number is permanently retired and never reused | Phase 1.1 emptied it — every file moved to the domain that owns it. It was a pre-domain catch-all with no ownership boundaries, which is exactly how pricing ended up in three places | Keeping it as a thin cross-cutting reference layer; deleting the folder outright | Jimmy Fishbeck |

## Open questions

Decisions awaiting the owner's input. AI should surface these rather than
assume an answer.

| # | Question | Blocks | Raised |
|---|----------|--------|--------|
| Q1 | What are the actual burdened labor rates for Fishbeck crews and subs? | Phase 2.2 — the entire labor database | 2026-07-31 |
| Q2 | Which suppliers get preferred status, and what are the negotiated discounts? | Phase 2.1, 6.5 | 2026-07-31 |
| Q3 | What overhead and profit percentages should be standard by project type? | Phase 2.7 | 2026-07-31 |
| Q4 | Are there W-2 employees yet, or 1099 subs only? | Phase 9.1 (HR trigger) | 2026-07-31 |
| Q5 | Is there existing job-cost history (past invoices/receipts) to seed `Historical_Costs`? | Phase 5.1 — determines whether the feedback loop starts warm or cold | 2026-07-31 |
| Q6 | What accounting system is in use (QuickBooks, spreadsheets, other)? | Phase 6.3 integration design | 2026-07-31 |
| Q7 | The 3 subcontractors (`SUB-0001`–`0003`) have no company name, license number, or insurance on file. Who are they, and are their COIs current? | Scheduling any sub work; they are flagged `compliance_cleared: false` and must not be scheduled | 2026-08-06 |
| Q8 | Are the 2024 national bid-package rates actually representative of what Fishbeck charges in the Twin Cities? | Promoting 40 `UP-####` rows above `confidence: medium` | 2026-08-06 |
| Q9 | LVP per sqft: `MAT-0001` says $1.80–3.50, `lib/workOrderPrompt.js` says $2.50–4.50. Which is correct? | Phase 1.4 reconciliation; the work-order tool currently budgets ~40% high on the low end | 2026-08-12 |

## Future automation ideas

- Link decisions to the commits that implemented them.
- Surface open questions in every session-start summary until answered.

## AI usage notes

Add a row here before making any structural change. If a request would
contradict an existing decision, cite the decision ID and confirm before
proceeding. Surface unanswered open questions when they block the work at hand.
