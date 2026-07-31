---
id: SYS-0009
title: AI Operating Protocol
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [governance, ai, standard, automation, prompt-library]
related: [SYS-0001, SYS-0003, SYS-0006, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# AI Operating Protocol

The contract every AI assistant follows when working inside Fishbeck OS —
Claude, Codex, ChatGPT, Hermes, or anything that comes next. Model-agnostic by
design.

## Session start sequence

Run this every session, before producing anything:

1. Read `_System/00_Fishbeck_OS_Charter.md` — the principles.
2. Read `_System/01_Architecture_Master.md` — where things live.
3. Read `_System/09_Build_Roadmap.md` — what phase we're in.
4. Read `_Registry/Document_Registry.csv` — what already exists.
5. **Identify the highest-value next deliverable** whose dependencies are met.
6. Produce **only that deliverable**.
7. Close with: completed · dependencies created · next tasks · priority scores.

## The five hard rules

1. **Never invent a number.** Every cost, rate, dimension, or code reference is
   either read from a source-of-truth file with a cited ID, or marked
   `[confirm]` and tagged `needs-verification`.
2. **Never invent an ID.** Read `_Registry/Entity_ID_Registry.csv`, take the
   next number, increment it in the same change.
3. **Never invent a folder.** If nothing in `SYS-0002` fits, stop and ask.
4. **Never approve.** AI moves documents to `review` at most. Only Jimmy approves.
5. **Never duplicate a fact.** Reference the owning ID instead.

## Answering questions about the company

Every factual claim cites its source:

> Interior painting runs $2.35–$3.75/sf (`UP-0031`, `13_Estimating/Unit_Pricing`,
> confidence: high, effective 2026-07-01).

If no source exists, say so plainly:

> There is no verified production rate for spray-applied ceilings in the OS yet.
> Industry range is roughly 800–1,200 sf/hr, but that is unverified and should
> not be quoted. Recommend capturing it on the next job.

**Never fill a gap with a confident-sounding guess.** A stated gap is a
deliverable — it becomes a data-collection task.

## Creating artifacts

```
Check _Templates/  →  Issue ID  →  Write front matter  →  Write content
     →  Register in Document_Registry.csv  →  status: draft
```

If no template fits, **build the template first**, then the instance. Systems
over documents (`SYS-0001` #2).

## Trust and verification

| Source | Trust | Handling |
|--------|-------|----------|
| `approved` + `source_of_truth: true` | Authoritative | Cite directly |
| `approved`, not source of truth | Reliable | Cite; check against the owner |
| `review` / `draft` | Provisional | Flag status when citing |
| `deprecated` | Historical only | Never cite as current |
| `confidence: unverified` | Not usable externally | Internal reasoning only |
| Anything outside the OS | Unverified | Label as external, never as company fact |

## Working with pricing — the highest-risk area

Bad pricing costs real money. Pricing work requires:

1. Read the current row and its `effective_date`.
2. Never edit a historical row — add a superseding row (`SYS-0007`).
3. State the evidence for any change: invoice, supplier quote, or job actuals.
4. Cross-check against `13_Estimating/Historical_Costs` before proposing.
5. Flag the downstream consumers that need regeneration — chiefly
   `lib/prompt.js` in the estimator app, which is a consumer, never a source.

## Scope discipline

The single largest failure mode for AI on this project is doing too much at once
and doing it shallowly.

| Do | Don't |
|----|-------|
| One coherent deliverable per session | Scaffold fourteen domains with empty files |
| Build the standard, then the instances | Write instances with no standard |
| Say "this depends on X which doesn't exist yet" | Invent X to unblock yourself |
| Finish and register what you start | Leave half-registered orphans |

## Handling conflicts

When two files disagree:

1. Check the source-of-truth table in `SYS-0002` — it decides.
2. Fix the non-authoritative file to reference the authoritative one.
3. Report the conflict explicitly; don't fix it silently.

When a request conflicts with a Charter principle: say so in one or two
sentences, then proceed with the user's decision if they confirm.

## Prompt library integration

Reusable prompts live in `08_AI_Agents/Prompt_Library/` as `PMT-####`. When you
find yourself writing the same instruction block a second time, that is a
signal: stop and make it a `PMT` entry.

## Automation capture

Every time a manual step is performed, log it as a candidate in
`_Registry/Automation_Backlog.csv` with the estimated hours saved per month.
Manual work is technical debt (`SYS-0001` #8).

## Required response format

Every session response ends with:

```markdown
## 1. Completed
- <deliverable, with file paths and IDs>

## 2. Dependencies created
- <what now exists that unblocks other work>

## 3. Recommended next tasks
| # | Task | Depends on | Priority |
|---|------|-----------|----------|

## 4. Priority scores
1–10, where 10 = blocks the most downstream work.
```

## Priority scoring rubric

| Score | Meaning |
|-------|---------|
| 10 | Blocks multiple domains; nothing meaningful proceeds without it |
| 8–9 | Unblocks a major domain or protects revenue |
| 6–7 | High leverage, no hard blockers |
| 4–5 | Valuable, deferrable |
| 1–3 | Nice to have; do when the queue is clear |

Weight by: **downstream unblocking > revenue impact > risk reduction > polish.**

## Future automation ideas

- Ship this file as a system prompt for a dedicated Fishbeck OS agent.
- MCP server exposing the registries as queryable tools.
- Embedding index over the OS so any agent retrieves by meaning, not filename.
- Automated conflict detection across `source_of_truth: true` documents.

## AI usage notes

This file governs you. Read it first, follow it exactly, and flag it if it ever
conflicts with what you're being asked to do.
