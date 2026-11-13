---
id: TPL-RFI
title: Template — Request for Information
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
related: [TPL-PROJECT-CHARTER, TPL-CHANGE-ORDER]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Request for Information

Copy below the line into
`14_Projects/PRJ-####_.../06_RFIs_Submittals/PRJ-####_RFI-##_<Short-Title>.md`.

An RFI creates a **written record of a question and its answer.** Verbal answers
to field questions are how disputes start.

---

```yaml
---
id: RFI-##
title: <The question, summarized>
type: record
domain: 14_Projects
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [project-management, <trade>]
related: [PRJ-####]
source_of_truth: true
ai_usage: read-write
confidence: high
project_id: PRJ-####
---
```

# RFI-## — <Title>

| Field | Value |
|-------|-------|
| Project | `PRJ-####` — <address> |
| RFI # | RFI-## |
| Date submitted | YYYY-MM-DD |
| Submitted to | client / architect / inspector / engineer / supplier |
| Response needed by | YYYY-MM-DD |
| Status | open / answered / closed |
| Blocks work? | yes / no |

## Question

<State one question. Multiple questions get multiple RFIs — otherwise a partial
answer leaves you stuck.>

## Background

<What was found, what the documents say, why it's ambiguous.>

## Reference

| Type | Reference |
|------|-----------|
| Drawing / spec | |
| Code section | `CODE-####` |
| Photo | `PRJ-####_YYYY-MM-DD_<area>_detail_001.jpg` |
| Contract clause | |

## Proposed solution

<Always propose an answer. It speeds responses dramatically and protects you if
the response never comes.>

**Cost impact of proposal:** $<amount or "none">
**Schedule impact:** <days or "none">

## Response

| Field | Value |
|-------|-------|
| Responded by | |
| Date | YYYY-MM-DD |
| Response | |

## Resulting action

- [ ] No change — proceed as documented
- [ ] Change order required → `CO-##`
- [ ] Drawing/spec revision received
- [ ] Escalate

## Delay tracking

| Field | Value |
|-------|-------|
| Work stopped | YYYY-MM-DD |
| Work resumed | YYYY-MM-DD |
| Days lost | |

Days lost here feed `KPI-011` schedule variance and support any delay claim.

## Future automation ideas

- Auto-remind when an RFI passes its response-needed date.
- Auto-create the linked change order when the response implies scope change.
- Report on RFI volume by cause to find weak spots in scoping and documentation.

## AI usage notes

When an RFI response implies added scope, immediately propose a `CO-##` — an
answered RFI that changes the work but never becomes a change order is
unbilled work.
