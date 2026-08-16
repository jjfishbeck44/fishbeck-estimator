---
id: TPL-PROJECT-CHARTER
title: Template — Project Charter
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, project-management, operations]
related: [SYS-0004, SYS-0006, TPL-DAILY-REPORT]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Project Charter

Copy below the line into `14_Projects/PRJ-####_<YYYY>_<City>_<Address>/00_Project_Charter.md`.

The charter is the **index of the project**. Every other project artifact hangs
off it. It is created before work starts and closed out at the end.

---

```yaml
---
id: PRJ-####
title: <Address or project name>
type: project
domain: 14_Projects
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: monthly
next_review: YYYY-MM-DD
tags: [<project-type>, <client-type>, <city>]
related: [CLI-####, EST-####, CON-####]
source_of_truth: true
ai_usage: read-write
confidence: high
client_id: CLI-####
estimate_id: EST-####
---
```

# PRJ-#### — <Project Name>

## Snapshot

| Field | Value |
|-------|-------|
| Project ID | `PRJ-####` |
| Client | `CLI-####` — <name> |
| Property | `PRP-####` (if tracked) |
| Address | <full address> |
| Project type | <rental-turn / kitchen-remodel / …> |
| Contract value | $<amount> |
| Estimate | `EST-####` |
| Contract | `CON-####` |
| Start date | YYYY-MM-DD |
| Target completion | YYYY-MM-DD |
| Actual completion | YYYY-MM-DD |
| Lifecycle stage | preconstruction / active / punch-list / closeout / warranty-period / archived |

## Scope of work

### Included

- <Trade>: <specific scope>

### Explicitly excluded

- <What the client might assume is included but isn't>

Exclusions prevent the most expensive kind of dispute. Be specific.

## Site conditions and constraints

| Item | Detail |
|------|--------|
| Access | <lockbox, tenant schedule, parking> |
| Occupancy | occupied / vacant |
| Utilities | <on/off, who pays> |
| Known hazards | <asbestos, lead, mold — pre-1978 triggers lead-safe rules> |
| Permit required | yes / no — cite `15_Construction_Knowledge/Permitting_Matrix.md` |
| HOA / city constraints | <detail> |

## Budget

| Category | Estimated | Actual | Variance |
|----------|-----------|--------|----------|
| Labor | | | |
| Materials | | | |
| Subcontractors | | | |
| Equipment / rental | | | |
| Permits / fees | | | |
| Contingency | | | |
| **Total** | | | |

Actuals are filled at closeout from `21_Finance` and become `HC-#####` rows.

## Schedule

| Phase | Planned start | Planned end | Actual start | Actual end |
|-------|---------------|-------------|--------------|------------|
| | | | | |

## Team

| Role | Who | ID |
|------|-----|-----|
| Project lead | Jimmy Fishbeck | |
| Crew | | `EMP-####` |
| Subcontractor — <trade> | | `SUB-####` |

## Change orders

| CO | Date | Description | Amount | Status |
|----|------|-------------|--------|--------|
| CO-01 | | | | |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| | | | |

## Closeout gate

Per `DEC-0010`, this project cannot be marked `archived` until **all five**
exist:

- [ ] Historical cost rows written to `13_Estimating/Historical_Costs` (`HC-#####`)
- [ ] Lessons learned recorded (`LL-####`)
- [ ] New defect patterns added to the defect library (`DEF-####`)
- [ ] Vendor/sub performance recorded in `17_Purchasing`
- [ ] Before/after photos catalogued and case-study candidacy assessed

## Related documents

- Estimate: `01_Estimate/`
- Contracts: `02_Contracts/`
- Daily reports: `03_Daily_Reports/`
- Photos: `04_Photos/`
- Change orders: `05_Change_Orders/`
- RFIs/submittals: `06_RFIs_Submittals/`
- Invoices: `07_Invoices/`
- Punch list: `08_Punch_List/`
- Closeout: `09_Closeout/`

## AI usage notes

This charter is the entry point for any question about this job. Read it before
reading any other file in the project folder.
