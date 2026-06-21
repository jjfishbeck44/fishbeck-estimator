# Data Formats

Canonical tabular schemas for the Knowledge Base. These define the column structure
for pricing, material costs, and production rates so the data stays consistent and
machine-readable (usable by the estimator, bids, and SaaS).

**Do not change column structures without explicit instruction** (see
`08_AI_Agents/Boundary_Rules.md`). Add rows; don't rename or reorder columns.

## Files
- `Pricing_Template.csv` — line-item pricing ranges by category
- `Material_Costs_Template.csv` — unit material costs
- `Production_Rates_Template.csv` — labor production rates (units/time)

## Conventions
- Currency in USD, no symbols (e.g., `4500`), ranges via `_low`/`_high` columns.
- Units explicit (sqft, lf, ea, hr, day).
- `last_updated` as `YYYY-MM-DD`.
- Each row has a stable `id` for referencing.
- Source/notes column for where the number came from.

## Relationship to other KB folders
- `Pricing/` holds the working pricing reference and narrative; the structured
  rows follow this schema.
- `Material_Costs/` and `Production_Rates/` mirror these schemas.
- Keep the estimator's `lib/prompt.js` pricing aligned with `Pricing_Template.csv`.
