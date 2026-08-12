---
id: SYS-0011
title: Migration Map — Legacy Content to Governed Architecture
type: standard
domain: _System
status: approved
version: 1.1.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-08-06
review_cycle: as-needed
next_review: 2026-09-30
tags: [governance, architecture, standard]
related: [SYS-0002, SYS-0006, SYS-0010]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# Migration Map

> **Status: EXECUTED 2026-08-06 (Phase 1.1).** All moves below are complete.
> `09_Knowledge_Base` is retired (`DEC-0012`) and holds only a pointer README.
> Front-matter backfill on the remaining ~100 legacy files is Phase 1.2.

The OS already contains 117 files built before the governance layer existed.
This map defines exactly where each moves. **It is the specification for Phase
1.1 — the moves are not executed by this document.**

## Migration principles

1. **Move, don't copy.** A copied file becomes a second source of truth.
2. **Leave a pointer.** The old location gets a stub README pointing to the new
   home until all inbound links are fixed.
3. **Preserve IDs.** `PRD-####` and pricing row IDs survive the move unchanged.
4. **One domain per commit.** Migrations are reviewable only if they're small.
5. **Fix links in the same commit as the move.**

## Disposition summary

| Legacy folder | Disposition |
|---------------|-------------|
| `00_Brand` | **Stay.** Canonical for identity/voice. Add front matter. |
| `01_Website` | **Stay.** Canonical for site content. Add front matter. |
| `02_SEO` | **Stay.** Add front matter. |
| `03_Content` | **Stay.** Add front matter. |
| `04_Case_Studies` | **Stay.** Link each to its `PRJ-####`. |
| `05_Digital_Products` | **Stay.** Source material now comes from `12_Operations`. |
| `06_Sales_Marketing` | **Stay.** Add front matter. |
| `07_SaaS` | **Stay.** Add front matter. |
| `08_AI_Agents` | **Extend** with `Prompt_Library/`, `Automation/`, `Scripts/`, `APIs/`. |
| `09_Knowledge_Base` | **Split.** See detail below. |
| `10_Archive` | **Stay.** Now the destination for all deprecations. |

## `09_Knowledge_Base` split — the main migration

The Knowledge Base was a catch-all before domains existed. Its contents belong
to the new operational domains.

| Legacy path | New home | Notes |
|-------------|----------|-------|
| `Pricing/Market_Rates_2024.csv` | `13_Estimating/Unit_Pricing/Market_Rates_2024.csv` | Preserve `SW-01`-style IDs; remap to `UP-####` in Phase 2.5 with a crosswalk column |
| `Pricing/Market_Rates_2024.md` | `13_Estimating/Unit_Pricing/` | Narrative accompanying the data |
| `Pricing/README.md` | `13_Estimating/Unit_Pricing/README.md` | Becomes the `_Data` schema doc |
| `Data_Formats/Pricing_Template.csv` | `13_Estimating/_Data/` | Schema reference |
| `Data_Formats/Material_Costs_Template.csv` | `13_Estimating/Material_Database/` | Seeds `MAT-####` |
| `Data_Formats/Production_Rates_Template.csv` | `13_Estimating/Production_Rates/` | **IDs `PRD-0001`–`PRD-0004` preserved** |
| `Data_Formats/README.md` | `13_Estimating/_Data/README.md` | Schema authority |
| `Material_Costs/README.md` | `13_Estimating/Material_Database/README.md` | |
| `Production_Rates/README.md` | `13_Estimating/Production_Rates/README.md` | |
| `Estimating/README.md` | `13_Estimating/README.md` | Merge into the governed README |
| `Minnesota_Codes/README.md` | `15_Construction_Knowledge/Minnesota_Codes/README.md` | |
| `Permitting_Matrix.md` | `15_Construction_Knowledge/Permitting_Matrix.md` | Add `code_refs` front matter |
| `Building_Systems/README.md` | `15_Construction_Knowledge/Building_Systems/README.md` | |
| `Assessments/README.md` | `12_Operations/SOP_Library/` | Becomes SOP-0002 source material |
| `Construction_Management/README.md` | `12_Operations/README.md` | Merge |
| `SOPs/README.md` | `12_Operations/SOP_Library/README.md` | Merge into governed README |
| `Subcontractor_Directory.csv` | `17_Purchasing/Vendor_Database/Subcontractor_Directory.csv` | Remap IDs to `SUB-####` |
| `Subcontractor_Directory.md` | `17_Purchasing/Vendor_Database/` | |
| `Post_Mortems.md` | `16_Quality/Lessons_Learned/` | Becomes the `LL-####` seed |

**After the split**, `09_Knowledge_Base/` retains only genuinely cross-cutting
reference material. If it empties completely, it is deprecated per `SYS-0007`
and its number is retired — never reused.

## ID crosswalk requirement

Legacy pricing rows use category-prefixed IDs (`SW-01`, `SW-02`) that predate
`SYS-0006`. Do **not** renumber them destructively. Add a `legacy_id` column:

```csv
id,legacy_id,category,item,unit,price_low,price_high,...
UP-0001,SW-01,Site Work,Site clearing,per acre,3500,8500,...
```

This preserves the audit trail for any estimate that already cited `SW-01`.

## Front-matter backfill

All 117 legacy files need front matter per `SYS-0003`. Backfill defaults:

| Field | Default for legacy files |
|-------|-------------------------|
| `status` | `review` — legacy content is unverified until read |
| `version` | `0.9.0` — pre-approval |
| `owner` | `Jimmy Fishbeck` |
| `created` | Git first-commit date of the file |
| `updated` | Migration date |
| `confidence` | `medium` for narrative, `low` for any file containing `[confirm]` |
| `ai_usage` | `read-write` |
| `source_of_truth` | Per the `SYS-0002` table; default `false` |

Files containing `[confirm]` markers additionally get the `needs-verification`
tag.

## Known duplication to resolve

The migration must collapse these into single sources:

| Fact | Currently in | Resolve to |
|------|-------------|------------|
| Pricing ranges | `09_KB/Pricing/*.csv`, `lib/prompt.js`, `public/js/calculators/pricing.js` | `13_Estimating/Unit_Pricing/` — the other two become generated consumers |
| Service descriptions | `00_Brand/Service_Descriptions.md`, `01_Website/Services/*.md` | `00_Brand` authoritative; website pages reference it |
| Subcontractor list | `09_KB/Subcontractor_Directory.{csv,md}` | `17_Purchasing/Vendor_Database/` |
| SOP intentions | `09_KB/SOPs/README.md`, `05_Digital_Products/SOP_Pack/README.md` | `12_Operations/SOP_Library/` authoritative; the pack is a derived product |

**The three-way pricing duplication is the highest-risk item in the entire OS.**
Three files can disagree about what a job costs. Resolving it is Phase 1.4.

## Repository placement note

Fishbeck OS currently lives inside the `fishbeck-estimator` application
repository. This is acceptable at current volume, but the OS and the app have
different lifecycles: the app auto-deploys to Vercel on every push to `master`,
so OS-only commits trigger unnecessary deployments.

**Recommendation:** once the OS exceeds ~500 files, split it into a dedicated
`fishbeck-os` repository and have the estimator consume its data via a generated
artifact. The architecture in `SYS-0002` is repository-agnostic, so the split is
a `git filter-repo` operation, not a redesign. Tracked as a Phase 1 decision.

## Migration checklist (per batch)

- [ ] Target folder exists with a governed README
- [ ] Files moved with `git mv` (preserves history)
- [ ] IDs preserved; `legacy_id` column added where renumbering occurred
- [ ] Front matter backfilled
- [ ] Pointer stub left at the old location
- [ ] Inbound links updated across the OS
- [ ] `_Registry/Document_Registry.csv` updated
- [ ] `npm test` passes (the app must not break)
- [ ] One domain per commit

## Future automation ideas

- `migrate.js` executing a batch from a declarative mapping table.
- Link checker that finds references to moved paths.
- Duplicate-fact detector comparing numeric values across CSVs.

## AI usage notes

Execute this migration in small, reviewable batches — one legacy folder per
commit. Run `npm test` after any change that touches pricing, since the
estimator app consumes it. Never delete a legacy file; move it.
