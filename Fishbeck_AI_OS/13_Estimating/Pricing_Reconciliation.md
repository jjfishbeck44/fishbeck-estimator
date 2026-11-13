---
id: EST-0006
title: Pricing Reconciliation and AUT-004 Implementation Specification
type: spec
domain: 13_Estimating
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: 2026-11-13
updated: 2026-11-13
review_cycle: monthly
next_review: 2026-12-13
tags: [estimating, automation, internal, needs-verification]
related: [EST-0005, SYS-0007, SYS-0009, DEC-0007, DEC-0011, AUT-004]
source_of_truth: false
ai_usage: ai-generated
confidence: unverified
---

# Pricing reconciliation: internal draft, not approved pricing

## Outcome and boundary

Prepared from branch `claude/fishbeck-os-build-avw27s` at commit
`7967788223f9d953c24ac908228aa00118447e51` on 2026-11-13.
Jimmy instructed the assistant to use judgment to finish a provisional draft,
then seek clarification. That permits assumptions; it does not establish the
truth of prices, approve them, or verify supplier quotes or insurance.

This document is the reconciliation specification, not a new price database.
It references owning records instead of repeating their dollar values.
No runtime files, historical prices, confidence ratings, or approvals were
changed by this deliverable. Phase 1.4 and AUT-004 are **not complete**.

## Provisional resolution of Q9

**[confirm] Use MAT-0001 as the internal reference for mid-grade LVP material.**
This follows the existing source-of-truth assignment in DEC-0007, rather than
averaging conflicting numbers or silently preferring the work-order prompt.
MAT-0001 remains low-confidence with its existing source and effective date.
The decision that it is suitable for a particular purchase or client estimate
is unverified. No replacement material row is needed merely to point to the
existing owner of the fact.

MAT-0001 is material-only. UP-0030 is an installed unit-price reference. Neither
is a substitute for the other; do not add material cost to an installed rate
without checking the inclusions. The clearance LVP figure in the work-order
prompt has no matching verified supplier record and cannot be inferred from
the retail range.

## Consumer reconciliation map

| Existing consumer | Canonical references or gap | Required treatment |
|---|---|---|
| `lib/prompt.js`: LVP, hardwood, tile and carpet installation | UP-0030, UP-0029, UP-0031, UP-0032 | Reference the installed-price rows; keep material-only records separate. |
| `lib/prompt.js`: flatwork, asphalt and metal roofing | UP-0006, UP-0013, UP-0014 | Exact scope and units must remain explicit. |
| `lib/prompt.js`: insulation and drywall area rates | UP-0025 through UP-0028 | Preserve installation versus finishing distinction. |
| `lib/prompt.js`: stock/custom cabinets, quartz and trim | UP-0033 through UP-0036 | Do not treat linear-foot and area rates as interchangeable. |
| `lib/prompt.js`: interior/exterior area painting and staining | UP-0037, UP-0038, UP-0040 | Room/side rates are separate scopes, not automatic equivalents. |
| `lib/prompt.js`: light fixture replacement | Candidate UP-0020; range differs and install versus replacement scope may differ | [confirm] Scope equivalence before applying the canonical row. Do not silently overwrite the value. |
| `lib/prompt.js`: unit-turn, bathroom/kitchen packages, per-room/per-side work and other unmatched entries | No exact owning rows established by this review | Record as unmapped, not verified. Do not derive assemblies without quantities, labor and inclusions. |
| `lib/workOrderPrompt.js`: retail LVP and paint | MAT-0001 and MAT-0002 | Use references internally; retain current low confidence. |
| `lib/workOrderPrompt.js`: clearance prices, remaining materials and subcontract cleaning | No exact owning verified rows established | Supplier evidence or explicitly provisional draft records required. A retail quote does not verify a clearance price. |
| `lib/workOrderPrompt.js`: claimed sourcing savings and assumed apartment quantities/hours | Unsupported business claim and estimating assumptions in code | [confirm] Label assumptions; never present savings as proven performance. |
| `public/js/calculators/pricing.js`: rental, snow, turn packages, repair/replace, schedule, printing, assessments and other placeholders | Existing app placeholders lack canonical IDs and evidence | Inventory every leaf with unit/scope and provenance; do not call them verified merely because the file says single source of truth. |

This map identifies reviewed matches and gaps. It is not an exhaustive
machine-checked inventory of every numeric literal in the application.

## Risks found beyond Q9

- All reviewed unit-price records are medium-confidence; material and
  production records are low-confidence. None qualifies for client quotation
  under DEC-0011. Active status is not price approval.
- The estimator prompt currently instructs numeric estimates without enforcing
  that confidence restriction. The browser calculator exposes placeholder
  rates. This draft does not fix or deploy that existing behavior.
- Units in the source CSVs include `sqft` and human-readable `per ...` strings,
  while EST-0005 describes a closed shorthand vocabulary. A generator must
  normalize units explicitly or reject unsupported ones, never silently guess
  conversions. Acres, pounds, tons and scope-specific units need governance
  review before any schema/vocabulary expansion.
- The data-schema consumer list omits `lib/workOrderPrompt.js`; DEC-0007 and
  AUT-004 include it. The implementation must cover all three consumers.
- AUT-004's backlog dependency is Phase 2.5 while the immediate request asks for
  Phase 1.4 reconciliation. Build an internal preview first; do not silently
  erase the production dependency or claim the later phase complete.

## AUT-004 implementation contract

1. Read canonical CSV records, preserving IDs, sources, confidence, effective
   dates, scopes and units. No editable dollar constants in consumer mappings.
2. Define an explicit mapping from each existing consumer key to an owning ID
   or an unresolved entry. Do not treat similarly named scopes as equivalent.
3. Separate internal planning preview from client output. A client-facing
   result requires high-confidence eligible records for every priced component.
   Missing/low/medium/unverified inputs produce a clear unavailable or review
   required state, never zero-dollar work or a plausible-looking fallback.
4. Enforce that gate in deterministic server and UI code, not only in the AI
   prompt. AI output must not bypass it. Retain non-price scope extraction.
5. Generate the pricing sections consumed by the existing three files while
   preserving exports, response shapes and unrelated application logic.
   Decide and document adapter changes before altering response schemas.
6. Emit source IDs and generation provenance. Check generated output for drift
   in tests. Do not emit nondeterministic timestamps into committed output.
7. For genuinely new assumptions, issue IDs from the latest registry and update
   counters in the same commit. Use source paths and `[confirm]`, confidence
   unverified, without promoting them to approved company facts. If a historical
   price changes, deprecate it and add a superseding row with an effective date.
8. Keep development on the working branch. Do not merge, deploy, mark approved,
   or turn provisional values into live client pricing as part of this draft.

## Acceptance tests before a production switch

- Run the existing `npm test` suite and `node scripts/validate-os.js`.
- CSV parsing: quoted fields, empty values, duplicate IDs, malformed numbers,
  reversed ranges and missing required provenance fail clearly.
- Mapping: IDs resolve; every consumer price is mapped or explicitly withheld;
  material-only and installed scopes cannot accidentally combine.
- Lifecycle: inactive/deprecated and future-effective records cannot become
  current quote inputs; historical lookup remains reproducible.
- Confidence: every non-high case is refused in client output, including mixed
  assemblies and AI-generated responses. Internal previews are labeled.
- Generation: repeated runs are identical; manual edits to generated output
  fail drift checks; each numeric output traces to its owning record.
- Integration: calculator formatting handles unavailable prices without NaN,
  zero-dollar estimates or broken pages. API schemas and work-order extraction
  retain documented behavior. Browser smoke tests inspect actual output.
- Safety: original CSV numeric values unchanged unless explicitly superseded;
  registry allocation atomic; no new folders, secrets, logos or approvals.

## Clarification after the draft

Jimmy can correct the MAT-0001 provisional selection later. Until actual quote
or job evidence exists, no choice between the two legacy LVP ranges makes it
verified. Supplier invoices/quotes and job actuals are the evidence needed to
promote pricing, not another guessed number. Subcontractor identities,
insurance, license status, employee classification and burdened wages remain
unknown unless supported by separate records; none is assumed here.

## Completion and next work

- Completed: source review, provisional Q9 selection, scope/conflict map and
  testable implementation specification. No pricing reconciliation deployed.
- Dependencies created: this draft specification only; no new price dependency.
- Next: implement internal mapping and preview with confidence-gate tests (10/10);
  obtain material evidence to supersede provisional pricing (10/10); resolve
  unmatched consumer scopes and unit normalization before live generation (9/10).
