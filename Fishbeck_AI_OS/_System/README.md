---
id: SYS-0000
title: _System — Governance Layer
type: readme
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [governance, standard, index]
related: [SYS-0001, SYS-0002, SYS-0009]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# _System — Governance Layer

The rules the operating system obeys. Read these before touching anything else.

## Read order

| Order | File | ID | What it settles |
|-------|------|-----|-----------------|
| 1 | `00_Fishbeck_OS_Charter.md` | SYS-0001 | Purpose, principles, governance, change control |
| 2 | `01_Architecture_Master.md` | SYS-0002 | Every folder, every owner, source-of-truth table |
| 3 | `02_Naming_Conventions.md` | SYS-0004 | How everything is named |
| 4 | `03_Metadata_Standard.md` | SYS-0003 | YAML front matter — what makes the OS searchable |
| 5 | `04_Taxonomy_and_Tags.md` | SYS-0005 | Controlled tag vocabulary |
| 6 | `05_ID_Registry_Standard.md` | SYS-0006 | ID prefixes and the entity relationship model |
| 7 | `06_Version_Control_Standard.md` | SYS-0007 | Semver, git, deprecation, backups |
| 8 | `07_Document_Lifecycle.md` | SYS-0008 | draft → review → approved → deprecated |
| 9 | `08_AI_Operating_Protocol.md` | SYS-0009 | The contract every AI assistant follows |
| 10 | `09_Build_Roadmap.md` | SYS-0010 | Dependency-ordered phases 0–9 |
| 11 | `10_Migration_Map.md` | SYS-0011 | Where legacy content moves |
| 12 | `Decision_Log.md` | SYS-0012 | Structural decisions + open questions |

## The 60-second version

- One fact lives in exactly one file. Everything else references its ID.
- Every file carries YAML front matter with an ID, owner, status, and confidence.
- IDs come from `_Registry/Entity_ID_Registry.csv` and are never reused.
- Never invent a number, an ID, or a folder.
- AI drafts and reviews. Only Jimmy approves.
- A project isn't closed until its costs flow back into estimating.

## Amending a standard

1. Add a row to `Decision_Log.md`.
2. Bump the standard's `version` and `updated`.
3. Update anything that referenced the old rule.
4. One commit, scoped `docs(_system):`.

## Future automation ideas

- Ship `08_AI_Operating_Protocol.md` as a system prompt for a dedicated agent.
- CI validation of every rule in `03_Metadata_Standard.md`.
