# Estimating

How Fishbeck estimates work — methodology, assumptions, and the logic behind the
Fishbeck Estimator.

## Contents
- Estimating methodology (scope → quantities → pricing → range)
- Standard assumptions and contingencies
- Estimator prompt/logic notes (mirrors `lib/prompt.js`)
- Common scopes and how they're priced

## Rules
- Pull unit prices from `../Pricing/` and `../Data_Formats/`.
- Keep ranges honest; flag uncertainty.
