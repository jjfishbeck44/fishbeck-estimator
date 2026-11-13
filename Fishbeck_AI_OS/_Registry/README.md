---
id: SYS-0013
title: _Registry — Master Machine-Readable Indexes
type: database
domain: _Registry
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: monthly
next_review: 2026-08-31
tags: [governance, database, index, automation]
related: [SYS-0003, SYS-0006, SYS-0009]
source_of_truth: true
ai_usage: read-write
confidence: high
---

# _Registry — Master Machine-Readable Indexes

The relational spine of Fishbeck OS. Everything else is documents; these are the
tables that make the documents queryable.

## Registries

| File | Purpose | Update cadence | Consumers |
|------|---------|----------------|-----------|
| `Entity_ID_Registry.csv` | Every ID prefix and the next number to issue | On every ID issued | Every artifact creation |
| `Document_Registry.csv` | Every document in the OS with its metadata | On every document created | AI search, review scheduling |
| `KPI_Registry.csv` | Every KPI definition, formula, target, and source | Quarterly | `11_Executive`, `22_Analytics` |
| `Automation_Backlog.csv` | Manual processes awaiting automation | Whenever manual work is noticed | `08_AI_Agents`, roadmap planning |

## Schemas

### `Entity_ID_Registry.csv`
`prefix` · `entity` · `home_domain` · `digits` · `next_number` · `last_issued` ·
`status` · `source` · `confidence` · `last_updated` · `notes`

**The `next_number` column is the write-ahead log for the whole OS.** Read it,
use it, increment it — in the same commit as the artifact you created.

### `Document_Registry.csv`
Mirrors the front-matter fields from `SYS-0003`, plus `path`.

Tag lists use **pipe delimiters** (`governance|architecture`), never commas —
per `DEC-0008`, since these are CSV cells.

### `KPI_Registry.csv`
`id` · `kpi` · `category` · `definition` · `formula` · `unit` · `target` ·
`frequency` · `data_source` · `owner` · `status` · `source` · `confidence` ·
`last_updated` · `notes`

A KPI is only real when `data_source` points at a file that actually exists.
Targets marked `[confirm]` await owner input (see `SYS-0012` open questions).

### `Automation_Backlog.csv`
`id` · `automation` · `domain` · `trigger` · `current_manual_process` ·
`proposed_solution` · `hours_saved_monthly` · `complexity` · `depends_on` ·
`priority` · `status` · `source` · `confidence` · `last_updated` · `notes`

**Status values:** `backlog` · `planned` · `building` · `live` · `retired`

## Rules

1. Registry updates ship **in the same commit** as the artifact they describe.
2. Never edit a row's historical value — deprecate and supersede (`SYS-0007`).
3. Never reuse a retired ID.
4. `Document_Registry.csv` will become **derived** (generated from front matter)
   once `AUT-003` ships. Until then it is hand-maintained.

## Current state

| Registry | Rows | Notes |
|----------|------|-------|
| Entity ID | 55 prefixes | `SYS`, `DEC`, `AUT`, `PRD` have issued numbers; 11 domain-index codes reserved at `-0000`; the rest start at 1 |
| Document | 43 | Phase 0 files only — 117 legacy files backfill in Phase 1.2 |
| KPI | 15 | 5 targets marked `[confirm]` pending owner input |
| Automation | 9 | 48 est. hours/month of manual work identified |

## Future automation ideas

- `AUT-002` ID issuer — atomic increment, prevents collisions.
- `AUT-003` registry rebuild — makes the document registry derived, not manual.
- Port all four registries to SQLite once row counts exceed ~5,000; the schemas
  are already relational so the migration is mechanical.
- Expose the registries through an MCP server so any agent can query them.

## AI usage notes

Read `Entity_ID_Registry.csv` before creating anything with an ID. Add a row to
`Document_Registry.csv` for every document you create. When you perform a manual
step twice, add it to `Automation_Backlog.csv` with an honest
`hours_saved_monthly` estimate.
