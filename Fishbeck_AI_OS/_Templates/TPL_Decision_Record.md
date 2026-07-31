---
id: TPL-DECISION-RECORD
title: Template — Decision Record
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, decision, governance, strategy]
related: [SYS-0012]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Decision Record

Copy below the line into `_System/DEC-####_<Short-Title>.md`.

Small decisions go straight into the `Decision_Log.md` table. Use a full record
when the decision is expensive to reverse, affects multiple domains, or will be
questioned later.

---

```yaml
---
id: DEC-####
title: <Decision stated as a choice made>
type: decision
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: as-needed
next_review: YYYY-MM-DD
tags: [decision, governance, <domain area>]
related: [SYS-####]
source_of_truth: true
ai_usage: read-only
confidence: high
---
```

# DEC-#### — <Decision>

## Status

proposed / **accepted** / superseded by `DEC-####`

## Context

<What situation forced a decision? What constraints applied? Write this for
someone reading it in two years with no memory of today.>

## Decision

<State it in one sentence, in the active voice: "We will…">

## Rationale

<Why this option won. Be concrete about the deciding factor.>

## Alternatives considered

| Option | Pros | Cons | Why rejected |
|--------|------|------|--------------|
| | | | |

Recording rejected options is the most valuable part of the record — it stops
the same debate from restarting.

## Consequences

**Positive:**
-

**Negative / accepted costs:**
-

**Neutral but notable:**
-

## Implementation

| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| | | | ☐ |

## Reversal cost

<How hard would this be to undo later? Cheap-to-reverse decisions deserve less
deliberation; expensive ones deserve more.>

## Review trigger

<What new information would make us revisit this? Name it now, while thinking
clearly.>

## Future automation ideas

- Link decisions to implementing commits.
- Surface review triggers automatically when their condition is met.

## AI usage notes

Check the decision log before proposing a structural change. If a request
contradicts an accepted decision, cite the decision ID and confirm before
proceeding.
