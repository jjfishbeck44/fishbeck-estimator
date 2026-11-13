---
id: SM-0001
title: Bid Templates
type: readme
domain: 06_Sales_Marketing
status: review
version: 0.9.0
owner: Jimmy Fishbeck
created: 2026-06-21
updated: 2026-08-15
review_cycle: semiannual
next_review: 2027-02-15
tags: [sales, marketing, index]
source_of_truth: true
ai_usage: read-write
confidence: medium
---

# Bid Templates

Standardized, execution-ready bid structures, separated by trade and project type.
Bids pull pricing from `13_Estimating/_Data/` and follow the formatting
rules in `00_Brand/AI_Communication_Style.md` and `00_Brand/Print_Collateral_Specs.md`.

## Files
- `_Bid_Structure.md` — the standard bid format every bid follows
- Add per-trade / per-project-type templates as needed, e.g.:
  - `Rental_Turn_Bid.md`
  - `Renovation_Bid.md`
  - `Painting_Bid.md`
  - `Flooring_Bid.md`
  - `Demolition_Bid.md`

## Rules
- All prices sourced from the Knowledge Base. Flag gaps with `[confirm: …]`.
- Ranges where appropriate; never invent exact figures.
- Print-ready: 8.5"×11", 1/8" increments, max 3 numbered items per list (group into
  phases beyond that).
- Every bid states scope, exclusions, assumptions, price, terms, and validity.
