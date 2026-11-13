---
id: TPL-DAILY-REPORT
title: Template — Daily Field Report
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, project-management, operations, analytics]
related: [TPL-PROJECT-CHARTER, SYS-0010]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Daily Field Report

Copy below the line into
`14_Projects/PRJ-####_.../03_Daily_Reports/PRJ-####_Daily_YYYY-MM-DD.md`.

Daily reports are the raw material for `KPI-005` labor efficiency and
`KPI-011` schedule variance. Keep them short enough to actually get filled out —
under three minutes.

---

```yaml
---
id: DR-YYYY-MM-DD
title: Daily Report — PRJ-#### — YYYY-MM-DD
type: report
domain: 14_Projects
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [<project-type>, project-management, operations]
related: [PRJ-####]
source_of_truth: true
ai_usage: read-write
confidence: high
project_id: PRJ-####
---
```

# Daily Report — `PRJ-####` — YYYY-MM-DD

| Field | Value |
|-------|-------|
| Weather | <temp, conditions — matters for concrete, paint, roofing, exterior> |
| On site | <names / `EMP-####`> |
| Hours worked | <total person-hours> |
| Subs on site | `SUB-####` — <trade>, <hours> |

## Work completed today

| Trade | Task | Quantity | Unit | Hours | Rate achieved | `PRD-####` |
|-------|------|----------|------|-------|---------------|------------|
| | | | | | qty ÷ hours | |

**The `rate achieved` column is the whole point of this report.** It is what
recalibrates the production rate database and makes future estimates accurate.

## Materials received

| Item | Qty | Vendor | PO | Receipt |
|------|-----|--------|-----|---------|
| | | `VEN-####` | `PO-####` | `RCT-#####` |

## Issues and delays

| Issue | Impact (hrs) | Cause | Resolution | Follow-up |
|-------|-------------|-------|------------|-----------|
| | | | | `RFI-##` / `CO-##` |

Delay causes use this closed set so they can be analyzed:
`weather` · `material-delay` · `sub-no-show` · `hidden-condition` ·
`client-decision` · `inspection` · `rework` · `access` · `equipment-failure`

## Safety

- [ ] Site secured at end of day
- [ ] No incidents
- Incident detail (if any): <describe; also file per `24_Legal_Risk`>

## Photos taken

| File | Area | Stage |
|------|------|-------|
| `PRJ-####_YYYY-MM-DD_<area>_<stage>_001.jpg` | | |

## Tomorrow's plan

- <Task> — <who> — <expected quantity>

## Future automation ideas

- Voice-note → structured daily report via transcription + extraction.
- Auto-compute rate achieved and flag >20% variance from the `PRD` row.
- Roll delay causes up into a monthly Pareto chart.
- Auto-ingest weather from a station near the jobsite.

## AI usage notes

When summarizing a project, read daily reports in date order. Compare
`rate achieved` against the cited `PRD-####` row and propose a rate update when
three or more jobs agree on a different number.
