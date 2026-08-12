---
id: KB-0000
title: 09_Knowledge_Base — Deprecated, Contents Migrated
type: readme
domain: 09_Knowledge_Base
status: deprecated
version: 2.0.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-06
review_cycle: as-needed
next_review: 2027-08-06
tags: [governance, index, archived]
related: [SYS-0002, SYS-0011, DEC-0012]
source_of_truth: false
ai_usage: read-only
confidence: high
---

# 09_Knowledge_Base — DEPRECATED

**This domain is retired.** Its contents were migrated to the operational domains
in Phase 1.1 (`SYS-0011`). The folder number `09` stays permanently retired and is
never reused (`SYS-0002`).

This file exists as a pointer so old links and old habits land somewhere useful.

## Where everything went

| Was | Now |
|-----|-----|
| `Pricing/Market_Rates_2024.csv` | `13_Estimating/Unit_Pricing/Market_Rates_2024.csv` |
| `Pricing/Market_Rates_2024.md` | `13_Estimating/Unit_Pricing/Market_Rates_2024.md` |
| `Pricing/README.md` | `13_Estimating/Unit_Pricing/README.md` (`EST-0001`) |
| `Data_Formats/Pricing_Template.csv` | `13_Estimating/_Data/Pricing_Template.csv` |
| `Data_Formats/README.md` | `13_Estimating/_Data/README.md` (`EST-0005`) |
| `Data_Formats/Material_Costs_Template.csv` | `13_Estimating/Material_Database/Material_Costs.csv` |
| `Material_Costs/README.md` | `13_Estimating/Material_Database/README.md` (`EST-0003`) |
| `Data_Formats/Production_Rates_Template.csv` | `13_Estimating/Production_Rates/Production_Rates.csv` |
| `Production_Rates/README.md` | `13_Estimating/Production_Rates/README.md` (`EST-0004`) |
| `Estimating/README.md` | Merged into `13_Estimating/README.md` (`EST-0000`) |
| `Minnesota_Codes/README.md` | `15_Construction_Knowledge/Minnesota_Codes/README.md` (`CK-0001`) |
| `Permitting_Matrix.md` | `15_Construction_Knowledge/Permitting_Matrix.md` (`CK-0002`) |
| `Building_Systems/README.md` | `15_Construction_Knowledge/Building_Systems/README.md` (`CK-0003`) |
| `SOPs/README.md` | `12_Operations/SOP_Library/README.md` (`OPS-0001`) |
| `Assessments/README.md` | `12_Operations/SOP_Library/Assessment_Walkthrough_Notes.md` (`OPS-0002`) |
| `Construction_Management/README.md` | Merged into `12_Operations/README.md` (`OPS-0000`) |
| `Subcontractor_Directory.csv` | `17_Purchasing/Vendor_Database/Subcontractor_Directory.csv` |
| `Subcontractor_Directory.md` | `17_Purchasing/Vendor_Database/README.md` (`PUR-0001`) |
| `Post_Mortems.md` | `16_Quality/Lessons_Learned/Post_Mortems.md` (`LL-0001`) |

## Which domain answers what now

| Question | Domain |
|----------|--------|
| What does it cost? | `13_Estimating` |
| What does the code require? | `15_Construction_Knowledge` |
| How do we do it? | `12_Operations` |
| Who do we buy from? | `17_Purchasing` |
| What did we learn? | `16_Quality` |

## Why it was retired

`09_Knowledge_Base` was a catch-all created before domains existed. It mixed cost
data, code references, procedures, vendor records, and retrospectives in one
folder with no ownership boundaries — which meant no single domain owned any fact
in it, and pricing lived in three places at once.

See `DEC-0012` for the decision, `SYS-0011` for the full migration spec.

## AI usage notes

**Do not create files here.** Route new content to the domain that owns it per
`SYS-0002`. If you encounter a link to `09_Knowledge_Base/...`, resolve it using
the table above and fix the link.
