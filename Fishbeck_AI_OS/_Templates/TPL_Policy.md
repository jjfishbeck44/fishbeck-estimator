---
id: TPL-POLICY
title: Template — Policy
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, hr, legal, governance]
related: [TPL-SOP, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Policy

Copy below the line into `19_HR/Policies/POL-####_<Short-Title>.md` or
`24_Legal_Risk/Policies/`.

**Policy vs. SOP:** a policy states *what is required and what happens if it
isn't followed*. An SOP states *how to do it*. If you're writing steps, you want
`TPL_SOP.md`.

---

```yaml
---
id: POL-####
title: <Policy name>
type: policy
domain: 19_HR
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: annual
next_review: YYYY-MM-DD
tags: [<function>, policy]
related: [SOP-####]
source_of_truth: true
ai_usage: read-write
confidence: medium
effective_date: YYYY-MM-DD
---
```

# POL-#### — <Policy Name>

## Purpose

<Why this policy exists — the risk it manages or the standard it sets.>

## Scope

**Applies to:** employees / subcontractors / all personnel on site / office only
**Effective date:** YYYY-MM-DD

## Policy statement

<The rule, stated plainly and unambiguously. Use "must," "must not," and "may" —
avoid "should," which reads as optional.>

## Requirements

| # | Requirement | Applies to | Verification |
|---|-------------|-----------|--------------|
| 1 | | | |

## Responsibilities

| Role | Responsibility |
|------|----------------|
| Employee / sub | |
| Supervisor | |
| Owner | |

## Exceptions

| Situation | Who may authorize | How to request |
|-----------|-------------------|----------------|
| | | |

If there are no exceptions, say so explicitly — silence invites improvisation.

## Non-compliance

| Severity | Consequence |
|----------|-------------|
| First occurrence | |
| Repeated | |
| Willful / safety-critical | |

## Legal and regulatory basis

| Authority | Reference | Applies how |
|-----------|-----------|-------------|
| <MN statute, OSHA, city ordinance> | | |

Anything with a legal basis should cite it — it makes the policy defensible and
tells the reader it isn't arbitrary.

## Related documents

- Procedure: `SOP-####`
- Checklist: `CHK-####`
- Contract clause: `CON-####`

## Acknowledgement

| Name | Role | Date | Signature |
|------|------|------|-----------|
| | | | |

## Future automation ideas

- Track acknowledgement status per person; alert on unacknowledged policies.
- Auto-remind on annual re-acknowledgement.
- Link policies to onboarding so new hires get the current set automatically.

## AI usage notes

Do not draft legal or safety policy language as final text — draft it as
`status: draft`, `confidence: low`, and flag that it needs review by a
Minnesota-licensed attorney or safety professional before it takes effect.
