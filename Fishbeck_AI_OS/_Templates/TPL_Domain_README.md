---
id: TPL-DOMAIN-README
title: Template — Domain README
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, governance, index]
related: [SYS-0002, SYS-0003]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Domain README

Every folder in the OS has a README. Copy below the line into
`NN_Domain/README.md`.

The README is the contract for its folder: what belongs there, what doesn't, who
owns it, and how it connects to everything else.

---

```yaml
---
id: <DOMAIN-CODE>
title: <NN_Domain_Name> — <Short Purpose>
type: readme
domain: NN_Domain_Name
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: quarterly
next_review: YYYY-MM-DD
tags: [<function tags>]
related: [SYS-0002]
source_of_truth: true
ai_usage: read-write
confidence: high
---
```

# NN_Domain_Name — <Purpose in five words>

## Purpose

<One paragraph: what this domain is for and what breaks without it.>

## Scope

| In scope | Out of scope |
|----------|--------------|
| | <and where it goes instead> |

The "out of scope" column is what prevents domain drift. Always name the
alternative home.

## Source of truth

**This domain is authoritative for:** <specific facts>
**This domain defers to:** <other domains, for what>

## Structure

```
NN_Domain_Name/
├── README.md
├── _Data/
└── Subject_Area/
```

## Contents

| Item | ID prefix | Purpose | Status |
|------|-----------|---------|--------|
| | | | |

## Naming

<Domain-specific naming beyond `SYS-0004`, or "Standard naming per SYS-0004.">

## Required fields

<Front-matter or CSV fields this domain requires beyond `SYS-0003`.>

## Workflows

| Workflow | Trigger | Steps | Output |
|----------|---------|-------|--------|
| | | | |

## Relationships

| Domain | Relationship |
|--------|-------------|
| `NN_Other` | <receives / supplies / references> |

## Build status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| | | ⬜ |

## Open questions

| # | Question | Blocks |
|---|----------|--------|

Unanswered questions belong here, not in someone's head. Mirror anything
company-wide into `_System/Decision_Log.md`.

## Future automation ideas

-

## AI usage notes

<How an AI should read from and write to this domain.>
