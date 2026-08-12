# Permitting Matrix

Reference for permits across Twin Cities jurisdictions (AHJs — Authorities Having
Jurisdiction). Tracks which work needs a permit, typical timelines, fees, portal
workflow, and required inspections. Verify details with each AHJ — rules change.

> All `[confirm]` values must be verified before relying on them in bids or content.

## When a permit is typically required
- Structural changes, additions, decks
- Electrical, plumbing, mechanical (HVAC) work
- Window/door openings altered, egress
- Re-roofing (jurisdiction dependent)
- Demolition (selective vs. full)

Cosmetic work (paint, flooring, trim, fixtures swapped like-for-like) usually does
not require a permit — **confirm per AHJ**.

## AHJ matrix
| Jurisdiction | Portal | Typical timeline | Fee basis | Notes |
|--------------|--------|------------------|-----------|-------|
| City of Saint Paul | [confirm portal] | [confirm] | Valuation-based | [confirm] |
| City of Minneapolis | [confirm portal] | [confirm] | Valuation-based | [confirm] |
| [Suburb] | OpenGov / [confirm] | [confirm] | [confirm] | Many metro suburbs use OpenGov |

## OpenGov portal automation workflow
Many Twin Cities suburbs run permitting through **OpenGov** (formerly ViewPoint
Cloud). Standard workflow:

**Phase 1 — Prepare**
- Gather: address/parcel, scope, valuation, drawings, contractor license, COI.
- Map scope to the correct OpenGov record type (building/electrical/plumbing/mechanical).

**Phase 2 — Submit**
- Create the application in the AHJ's OpenGov portal, attach documents, enter
  valuation, pay fees.
- Capture the record/permit number for the project file.

**Phase 3 — Track & inspect**
- Monitor status; respond to plan-review comments.
- Schedule required inspections; record results in the project file and
  `Post_Mortems.md` if delays occur.

> Automation scripts for high-volume submissions live in
> `07_SaaS/Permit_Automation/`. This file is the data/process reference they use.

## Required inspections (typical)
- **Rough-in:** framing, electrical, plumbing, mechanical (before cover)
- **Insulation** (where applicable)
- **Final:** each trade + building final
- Schedule order and lead times are AHJ-specific — `[confirm]`.

## Fee structures
- Most AHJs base building permit fees on **project valuation** plus plan-review and
  state surcharge. Trade permits often flat or fixture/circuit-count based.
- Record actual fees per job to refine estimates (`Data_Formats/Pricing_Template.csv`).
