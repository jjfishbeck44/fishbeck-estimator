# Permit Automation

Scripts and workflows that handle high-volume permit data entry across Twin Cities
AHJs — primarily **Python** (data prep, API/portal interaction, scraping/exports)
and **Power Automate** (Microsoft 365 flows, form intake, notifications, document
routing). This folder is the home for that automation code and its docs.

> Assumes functional staging environments already exist. Never run automation
> against production portals without authorization. Respect each portal's terms of
> service and rate limits.

## Data reference
All permit data, AHJ timelines, fees, required inspections, and the OpenGov workflow
live in `09_Knowledge_Base/Permitting_Matrix.md`. Automation reads from there and
from project files — it does not invent permit data.

## Suggested structure
```
Permit_Automation/
  README.md                ← this file
  python/                  ← Python scripts (intake prep, OpenGov submission helpers, exports)
  power_automate/          ← exported flow definitions + docs
  config/                  ← AHJ config (portals, record types) — no secrets in git
```

## Python scope
- Normalize project data into AHJ submission formats
- Batch-prepare applications and document bundles
- Pull/track permit status and inspection results
- Export reporting to feed `09_Knowledge_Base/Post_Mortems.md`

## Power Automate scope
- Intake forms → structured records
- Notifications on status changes and inspection scheduling
- Document routing (COIs, drawings, approvals)

## Security & integrity
- Secrets via environment variables / vault — never committed.
- Follow `08_AI_Agents/Boundary_Rules.md`: no fabricated permit data; flag gaps.
- Log every automated submission for audit.

> Part of `07_SaaS/`; may later feed the Investor Platform and Property Analyzer.
