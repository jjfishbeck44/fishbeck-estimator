# Pricing

Working pricing reference — cost ranges by service and line item. Structured rows
follow `../Data_Formats/Pricing_Template.csv`. This is a source of truth; the
estimator (`lib/prompt.js`) should stay aligned with it.

## Contents
- Service-level price ranges (renovation, rental turn, bath, kitchen, demo, etc.)
- Line-item pricing (labor + materials)
- Regional/Twin Cities adjustments

## Rules
- Currency USD; ranges (low–high). Never invent numbers — mark `[confirm]`.
- Update from real jobs via `../Post_Mortems.md`.
- Record source and `last_updated` for each number.
