---
id: SYS-0003
title: Metadata Standard
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [governance, metadata, ai-searchable]
related: [SYS-0001, SYS-0005, SYS-0006, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Metadata Standard

Every Markdown file in Fishbeck OS opens with YAML front matter. This is what
makes the OS AI-searchable, auditable, and automatable. A file without front
matter is treated as an unfinished draft.

## The block

```yaml
---
id: SOP-0012
title: Rental Turn — Standard Turnover Process
type: sop
domain: 12_Operations
status: approved
version: 1.2.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-08-14
review_cycle: annual
next_review: 2027-08-14
tags: [rental-turn, operations, property-management, checklist]
related: [SOP-0004, TPL-SOP, PRJ-0007]
source_of_truth: true
ai_usage: read-write
confidence: high
---
```

## Field reference

| Field | Required | Type | Rules |
|-------|----------|------|-------|
| `id` | **Yes** | string | Unique across the OS. Prefix per `SYS-0006`. |
| `title` | **Yes** | string | Human-readable. May contain spaces and em dashes. |
| `type` | **Yes** | enum | See type vocabulary below. |
| `domain` | **Yes** | string | Exact folder name from `SYS-0002`. |
| `status` | **Yes** | enum | `draft` · `review` · `approved` · `deprecated` |
| `version` | **Yes** | semver | `MAJOR.MINOR.PATCH` — see `SYS-0007`. |
| `owner` | **Yes** | string | A person, never "team" or "TBD". |
| `created` | **Yes** | date | `YYYY-MM-DD`, never changes. |
| `updated` | **Yes** | date | `YYYY-MM-DD`, bumped on every substantive edit. |
| `review_cycle` | **Yes** | enum | `monthly` · `quarterly` · `semiannual` · `annual` · `as-needed` |
| `next_review` | **Yes** | date | `updated` + `review_cycle`. |
| `tags` | **Yes** | list | 2–8 tags from `SYS-0005` controlled vocabulary. |
| `related` | No | list | IDs of related artifacts. Must resolve to real IDs. |
| `source_of_truth` | **Yes** | bool | `true` if this file is authoritative for its facts. |
| `ai_usage` | **Yes** | enum | `read-only` · `read-write` · `ai-generated` · `human-only` |
| `confidence` | **Yes** | enum | `high` · `medium` · `low` · `unverified` |

### Conditional fields

Add these when the type calls for it:

| Field | Applies to | Purpose |
|-------|-----------|---------|
| `project_id` | Anything inside `14_Projects` | Links artifact to its project |
| `client_id` | Client-facing artifacts | Links to `20_CRM` |
| `vendor_id` | Purchasing artifacts | Links to `17_Purchasing` |
| `code_refs` | Technical/means-and-methods docs | e.g. `[MN-IRC-R703.1, MN-IECC-402]` |
| `trade` | Estimating, quality, production docs | e.g. `drywall`, `roofing` |
| `effective_date` | Policies, pricing, contracts | When it takes force |
| `expires` | Insurance, certs, licenses | Drives renewal alerts |
| `supersedes` | Replacement documents | ID of the doc it replaces |
| `cost_impact` | Change orders, decisions | Dollar delta |

## Type vocabulary (closed set)

`charter` · `standard` · `policy` · `sop` · `checklist` · `template` ·
`database` · `reference` · `guide` · `spec` · `project` · `report` ·
`analysis` · `case-study` · `prompt` · `agent` · `contract` · `record` ·
`decision` · `index` · `readme`

Adding a type requires amending this file.

## Confidence field — why it exists

AI assistants must never present an unverified number as fact. `confidence`
drives how a number may be used:

| Value | Meaning | Permitted use |
|-------|---------|---------------|
| `high` | Verified against invoices, code text, or ≥3 real jobs | Quote to clients |
| `medium` | Reasonable industry data, 1–2 data points | Internal planning; qualify it |
| `low` | Estimated or inferred | Internal only; flag before use |
| `unverified` | Placeholder awaiting confirmation | **Never** quote externally |

Any file containing `[confirm]` markers must be `confidence: low` or
`unverified`.

## `ai_usage` field — write permissions

| Value | Meaning |
|-------|---------|
| `read-only` | AI may cite it; only the owner edits it (standards, contracts, codes) |
| `read-write` | AI may update it as part of normal work (SOPs, content, analyses) |
| `ai-generated` | AI produced it; needs human review before it goes external |
| `human-only` | AI must not read or reproduce it (sensitive HR, legal) |

## CSV metadata

CSVs cannot carry YAML. Each `_Data/` folder therefore carries a `README.md`
whose front matter has `type: database` and which documents, per CSV file:
the schema, the ID prefix, the owner, the update cadence, and the consumers.

Every CSV must include these columns:

| Column | Purpose |
|--------|---------|
| `id` | Stable primary key, prefix per `SYS-0006` |
| `status` | `active` · `inactive` · `deprecated` |
| `source` | Where the value came from |
| `confidence` | Same vocabulary as above |
| `last_updated` | `YYYY-MM-DD` |
| `notes` | Free text |

## Worked example — a low-confidence pricing note

```yaml
---
id: EST-0044
title: Exterior Painting Unit Pricing — 2026 Draft
type: database
domain: 13_Estimating
status: draft
version: 0.2.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [pricing, painting, exterior, estimating]
related: [PRD-0001, SYS-0006]
source_of_truth: false
ai_usage: read-write
confidence: unverified
trade: painting
effective_date: 2026-08-01
---
```

`source_of_truth: false` + `confidence: unverified` means: never quote these
numbers to a client until they are reconciled against real invoices.

## Validation checklist

- [ ] Front matter is the first thing in the file, fenced by `---`
- [ ] All required fields present
- [ ] `id` unique and prefix-correct
- [ ] `domain` matches the actual folder
- [ ] `next_review` consistent with `review_cycle`
- [ ] Tags drawn from the controlled vocabulary
- [ ] Every `related` ID exists
- [ ] `confidence` honestly reflects verification level

## Future automation ideas

- `validate-metadata.js` in CI — fails on missing fields or broken `related` IDs.
- Weekly job listing every doc past `next_review`.
- Expiry alerting from `expires` (insurance, licenses, certifications).
- Auto-build `_Registry/Document_Registry.csv` by parsing all front matter.
- Semantic search index keyed on `tags` + `type` + `domain`.

## AI usage notes

Write complete front matter on every file you create — no placeholders, no
`TBD` owners. When editing an existing file, bump `version` and `updated`, and
recompute `next_review`. Never raise `confidence` without stating the evidence.
