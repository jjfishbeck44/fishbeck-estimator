---
id: SYS-0005
title: Taxonomy and Controlled Tag Vocabulary
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [governance, taxonomy, metadata, ai-searchable]
related: [SYS-0003, SYS-0006]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Taxonomy and Controlled Tag Vocabulary

Free-text tags degrade into noise. Tags in Fishbeck OS come from these closed
lists. Adding a tag requires adding it here first.

## How to tag

Every document carries **2–8 tags**, drawn from at least two facets:

1. One **trade** tag (if the doc is trade-specific)
2. One **function** tag (always)
3. Optional **client-type**, **project-type**, **lifecycle**, and **system** tags

## Facet 1 — Trade

`sitework` · `demolition` · `concrete` · `framing` · `roofing` · `siding` ·
`windows-doors` · `insulation` · `drywall` · `painting` · `flooring` ·
`tile` · `trim-carpentry` · `cabinetry` · `countertops` · `plumbing` ·
`electrical` · `hvac` · `appliances` · `landscaping` · `fencing` ·
`decks` · `masonry` · `waterproofing` · `cleaning` · `general-labor`

## Facet 2 — Function

`estimating` · `pricing` · `scheduling` · `procurement` · `purchasing` ·
`operations` · `project-management` · `quality-control` · `safety` ·
`inspection` · `warranty` · `closeout` · `change-order` · `sales` ·
`marketing` · `content` · `seo` · `crm` · `finance` · `accounting` ·
`job-costing` · `hr` · `training` · `hiring` · `legal` · `insurance` ·
`equipment` · `maintenance` · `analytics` · `strategy` · `governance` ·
`automation` · `ai` · `software`

## Facet 3 — Client type

`homeowner` · `investor` · `property-manager` · `realtor` · `landlord` ·
`commercial` · `general-contractor` · `internal`

## Facet 4 — Project type

`rental-turn` · `unit-turn` · `kitchen-remodel` · `bath-remodel` ·
`whole-home-reno` · `basement-finish` · `flip` · `new-construction` ·
`addition` · `exterior` · `interior` · `repair` · `maintenance` ·
`assessment` · `consulting` · `owner-rep` · `emergency`

## Facet 5 — Lifecycle

`lead` · `estimate` · `proposal` · `contract` · `preconstruction` ·
`active` · `punch-list` · `complete` · `warranty-period` · `archived`

## Facet 6 — System / meta

`template` · `checklist` · `database` · `standard` · `sop` · `reference` ·
`code-compliance` · `minnesota` · `twin-cities` · `saint-paul` ·
`minneapolis` · `lessons-learned` · `root-cause` · `case-study` ·
`prompt-library` · `needs-verification` · `high-value` · `recurring`

## Tag hygiene rules

| Rule | Detail |
|------|--------|
| Case | Lowercase, always |
| Separator | Hyphen (`rental-turn`, not `rental_turn` or `rentalTurn`) |
| Plurality | Singular unless the concept is inherently plural (`lessons-learned`) |
| Synonyms | Banned. Use the canonical term below. |
| Count | 2–8 per document |
| New tags | Must be added to this file in the same commit that uses them |

### Canonical terms (do not use the synonym)

| Use this | Not this |
|----------|----------|
| `rental-turn` | turnover, make-ready, turn |
| `estimating` | bidding, takeoff, pricing-work |
| `quality-control` | qc, quality-assurance, qa |
| `project-management` | pm, proj-mgmt |
| `property-manager` | pm, prop-mgr |
| `job-costing` | cost-tracking, actuals |
| `windows-doors` | fenestration, openings |
| `trim-carpentry` | finish-carpentry, millwork |
| `code-compliance` | codes, building-code |

`pm` is deliberately banned — it is ambiguous between *project management* and
*property manager*.

## Tag → domain affinity

Used by AI to infer where a document belongs when the domain is unclear.

| Tag family | Likely domain |
|------------|---------------|
| Trade tags + `pricing` | `13_Estimating` |
| Trade tags + `code-compliance` | `15_Construction_Knowledge` |
| `sop`, `operations`, `scheduling` | `12_Operations` |
| `quality-control`, `inspection`, `root-cause` | `16_Quality` |
| `procurement`, `purchasing` | `17_Purchasing` |
| `equipment`, `maintenance` | `18_Equipment` |
| `hr`, `hiring`, `training` | `19_HR` |
| `crm`, client-type tags | `20_CRM` |
| `finance`, `accounting`, `job-costing` | `21_Finance` |
| `analytics` | `22_Analytics` |
| `flip`, `investor` + `analysis` | `23_Real_Estate` |
| `legal`, `insurance`, `safety` | `24_Legal_Risk` |
| `strategy`, `governance` (company-level) | `11_Executive` |
| `prompt-library`, `ai`, `automation` | `08_AI_Agents` |

## Special-purpose tags

- **`needs-verification`** — the document contains numbers not yet reconciled
  against real invoices or code text. Pairs with `confidence: low/unverified`.
  Nothing carrying this tag may be quoted to a client.
- **`high-value`** — this document directly drives revenue or prevents loss.
  Prioritized in reviews and backups.
- **`recurring`** — describes work that repeats; a prime automation candidate.

## Future automation ideas

- CI check rejecting tags absent from this file.
- Tag co-occurrence report to find missing taxonomy branches.
- Auto-suggest tags from document content using the affinity table.
- Dashboard of every `needs-verification` document, sorted by dollar exposure.

## AI usage notes

Never invent a tag. If nothing fits, use the closest match and propose the new
tag explicitly in your response. Always apply `needs-verification` to any
document where you generated numbers rather than read them from a verified
source.
