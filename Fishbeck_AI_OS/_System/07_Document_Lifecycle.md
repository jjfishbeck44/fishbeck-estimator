---
id: SYS-0008
title: Document Lifecycle
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [governance, standard, operations]
related: [SYS-0003, SYS-0007]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Document Lifecycle

Every artifact in the OS moves through the same five stages. This prevents the
two failure modes that kill knowledge systems: stale documents presented as
current, and good documents nobody can find.

## The lifecycle

```
  ┌─────────┐    ┌────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐
  │ PROPOSE │ →  │ DRAFT  │ →  │  REVIEW  │ →  │ APPROVED │ →  │ DEPRECATED │
  └─────────┘    └────────┘    └──────────┘    └──────────┘    └────────────┘
                                                    ↑ │
                                                    └─┘
                                              scheduled review
```

| Stage | `status` | `version` | Who acts | Exit criteria |
|-------|----------|-----------|----------|---------------|
| Propose | — | — | AI or Jimmy | Need identified; no existing system covers it |
| Draft | `draft` | `0.x.y` | AI or Jimmy | Content complete, front matter valid, template followed |
| Review | `review` | `0.x.y` | Jimmy | Facts verified, numbers reconciled, owner assigned |
| Approved | `approved` | `1.0.0`+ | Jimmy only | In force; may be cited and used externally |
| Deprecated | `deprecated` | any | Jimmy | Superseded or obsolete; archived per `SYS-0007` |

## Stage 1 — Propose

Before creating anything, answer these. If any answer is wrong, don't create it.

- [ ] Does a document already cover this? (If yes → **improve it instead**)
- [ ] Which domain owns it per `SYS-0002`?
- [ ] Is a reusable system possible instead of a one-off document?
- [ ] Do its inputs already exist? (Dependency order — `SYS-0001` principle 5)
- [ ] Is there a template in `_Templates/`?

## Stage 2 — Draft

- [ ] Copied from the correct `_Templates/TPL_*.md`
- [ ] ID issued from `_Registry/Entity_ID_Registry.csv` (registry incremented)
- [ ] Complete front matter per `SYS-0003`
- [ ] Filename per `SYS-0004`
- [ ] Tags from `SYS-0005`
- [ ] Every unverified number marked `[confirm]` and tagged `needs-verification`
- [ ] `confidence` set honestly
- [ ] Row added to `_Registry/Document_Registry.csv`

## Stage 3 — Review

The owner checks:

- [ ] **Accuracy** — numbers traced to invoices, code text, or real jobs
- [ ] **No conflicts** — nothing here contradicts another source-of-truth file
- [ ] **No duplication** — facts here don't already live elsewhere
- [ ] **Completeness** — all template sections filled or explicitly marked N/A
- [ ] **Actionability** — a new employee could execute it without asking questions
- [ ] **Code compliance** — technical content cites MN code sections

Rejection returns it to `draft` with specific, itemized feedback.

## Stage 4 — Approved

The document is in force. It may be quoted to clients, used to train, and cited
by AI as authoritative.

Approved documents are re-examined on their `review_cycle`:

| Cycle | Applies to |
|-------|-----------|
| `monthly` | Active project docs, lead pipeline, cash position |
| `quarterly` | Pricing, production rates, vendor terms, OKRs, taxonomy |
| `semiannual` | SOPs, checklists, marketing assets |
| `annual` | Standards, policies, brand, handbook |
| `as-needed` | Historical records, completed project files, case studies |

### Review outcomes

| Outcome | Action |
|---------|--------|
| Still accurate | Bump `updated` + `next_review`, PATCH version |
| Needs updating | Edit, MINOR or MAJOR bump, back through review |
| No longer needed | → Deprecated |

## Stage 5 — Deprecated

Per `SYS-0007`: set status, add `superseded_by`, move to `10_Archive/` with a
date prefix, retire the ID, fix inbound references.

**Never delete.** A wrong document that we learned from is more valuable than no
document — it explains why the current one says what it says.

## Special lifecycles

### Project documents

Project artifacts follow the job, not the review cycle:

```
preconstruction → active → punch-list → closeout → warranty-period → archived
```

At closeout, a project **must** emit:

1. Historical cost rows → `13_Estimating/Historical_Costs/` (the feedback loop)
2. A lessons-learned record → `16_Quality/Lessons_Learned/`
3. Any new defect patterns → `16_Quality/Defect_Library/`
4. Vendor performance data → `17_Purchasing/`
5. Before/after photos catalogued → `04_Case_Studies/` candidate

A project is not closed until all five exist. This is the single most important
rule in the operating system — it is what makes the company compound.

### Data (CSV) rows

```
active → deprecated
```
Rows never move to review. They are added with an `effective_date` and retired
with a superseding row (`SYS-0007`).

### Pricing

Pricing carries an extra gate: no pricing row reaches `active` without either
(a) three real job data points, or (b) a documented supplier quote. Otherwise it
stays `confidence: low` and tagged `needs-verification`.

## Anti-patterns

| Anti-pattern | Why it's banned |
|--------------|-----------------|
| "I'll add front matter later" | It never happens; the doc becomes unfindable |
| Approving your own AI-generated numbers | Confidence inflation; leads to bad quotes |
| Creating a doc because one is "missing" | Systems, not documents (`SYS-0001` #2) |
| Copying a fact into a second file | Duplication (`SYS-0001` #1) — reference the ID |
| `owner: TBD` | Unowned documents rot |
| Deleting a superseded file | Destroys the audit trail |

## Future automation ideas

- Weekly digest: documents past `next_review`, grouped by domain and owner.
- Closeout gate script that blocks a project moving to `archived` until all five
  closeout artifacts exist.
- Auto-open a review task when `next_review` arrives.
- Stale-draft alert for anything in `draft` longer than 30 days.

## AI usage notes

You may create drafts and move `draft` → `review`. You may **never** set
`approved`. When citing a document, check its `status` — never cite a `draft` or
`deprecated` document as fact, and always surface the `confidence` level when
quoting numbers.
