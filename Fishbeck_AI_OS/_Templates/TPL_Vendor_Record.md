---
id: TPL-VENDOR-RECORD
title: Template — Vendor / Subcontractor Record
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, purchasing, procurement, database]
related: [SYS-0006, TPL-DATABASE-SCHEMA]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Vendor / Subcontractor Record

Copy below the line into
`17_Purchasing/Vendor_Database/VEN-####_<Name>.md` (or `SUB-####` for
subcontractors).

The record holds narrative and compliance detail; the summary row lives in
`Vendor_Directory.csv` for querying. Both, not one or the other.

---

```yaml
---
id: VEN-####
title: <Vendor name>
type: record
domain: 17_Purchasing
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: annual
next_review: YYYY-MM-DD
tags: [purchasing, procurement, <trade>]
related: [PO-####]
source_of_truth: true
ai_usage: read-write
confidence: medium
vendor_id: VEN-####
---
```

# VEN-#### — <Vendor Name>

## Contact

| Field | Value |
|-------|-------|
| Company | |
| Type | supplier / subcontractor / rental / service |
| Primary contact | |
| Phone | |
| Email | |
| Address | |
| Account number | |
| Website / portal | |

## What they supply

| Category | Products / trades | Typical lead time |
|----------|-------------------|-------------------|
| | | |

## Commercial terms

| Field | Value |
|-------|-------|
| Payment terms | net 30 / COD / card |
| Discount | <%> — <basis: contractor pricing, volume tier> |
| Delivery fee | |
| Free delivery threshold | $ |
| Return policy | |
| Restocking fee | |
| Price protection | |

## Compliance — subcontractors only

**Do not schedule a sub without current documents on file.**

| Document | On file | Expires | Reference |
|----------|---------|---------|-----------|
| MN contractor license | ☐ | YYYY-MM-DD | |
| General liability insurance | ☐ | YYYY-MM-DD | |
| Workers' comp | ☐ | YYYY-MM-DD | |
| W-9 | ☐ | — | |
| Signed subcontractor agreement | ☐ | | `CON-####` |
| Lien waiver process agreed | ☐ | | |

Expiry dates go in the front matter `expires` field so `AUT-009` can alert.

## Performance history

| Metric | Value | Period | Source |
|--------|-------|--------|--------|
| On-time delivery rate | % | | `KPI-012` |
| Quality issues | <count> | | `DEF-####` |
| Price competitiveness | above / at / below market | | |
| Responsiveness | | | |
| Jobs used on | <count> | | `PRJ-####` list |

## Rating

| | Score (1–5) |
|---|---|
| Price | |
| Quality | |
| Reliability | |
| Communication | |
| **Overall** | |

**Status:** preferred / approved / conditional / do-not-use

Record *why* for `conditional` and `do-not-use` — an unexplained blacklist gets
forgotten and re-used.

## Notes

<Relationship history, negotiation leverage, who to ask for, quirks.>

## Future automation ideas

- Auto-compute on-time delivery from PO promised vs. received dates.
- Insurance expiry alerting (`AUT-009`).
- Price-history tracking per SKU to catch creeping increases.
- Automatic quote comparison across vendors for the same material.

## AI usage notes

Check compliance status before recommending a subcontractor for scheduling.
Never recommend a `do-not-use` vendor. When pricing materials, prefer vendors
marked `preferred` and apply their recorded discount.
