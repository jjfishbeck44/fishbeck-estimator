---
id: SYS-0007
title: Version Control Standard
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [governance, standard, automation]
related: [SYS-0003, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Version Control Standard

Git is the audit trail. Front matter is the human-readable version. Filenames
never carry versions.

## Document versioning — semantic versions

`MAJOR.MINOR.PATCH` in the `version` front-matter field.

| Bump | When | Example |
|------|------|---------|
| **MAJOR** (`1.0.0` → `2.0.0`) | Meaning changes; prior guidance is now wrong | Rental turn process restructured; old sequence no longer valid |
| **MINOR** (`1.0.0` → `1.1.0`) | Material addition; prior content still correct | New step added to a checklist; new pricing category |
| **PATCH** (`1.0.0` → `1.0.1`) | Typos, formatting, clarification | Fixed a broken link; reworded a sentence |

Pre-approval drafts sit at `0.x.y`. The first `approved` status sets `1.0.0`.

**Every version bump also updates `updated` and recomputes `next_review`.**

## Data versioning — CSV

CSVs are not semver'd. They version by row:

- **Never edit a historical row's value in place.** Set its `status` to
  `deprecated`, add a new row with a new ID and the new value.
- Rate and price tables carry `effective_date` so any past estimate can be
  reproduced with the pricing that was in force at the time.
- Schema changes (add/rename/remove a column) require a `DEC-####` decision
  record and a version bump on the owning `_Data/README.md`.

```csv
id,item,price_low,price_high,effective_date,status,notes
UP-0012,Interior paint - walls,2.10,3.40,2026-01-01,deprecated,Superseded by UP-0031
UP-0031,Interior paint - walls,2.35,3.75,2026-07-01,active,Material cost increase
```

This is what makes estimate-accuracy analytics possible: the estimate cites
`UP-0012`, and that row still exists.

## Git conventions

### Branches

| Branch | Purpose |
|--------|---------|
| `master` | Deployed truth. The estimator app auto-deploys from it. |
| `claude/<topic>-<id>` | AI working branches |
| `os/<domain>-<topic>` | Human OS work |

### Commit messages

Conventional commits, matching the repository's existing convention:

```
<type>(<scope>): <summary>

feat(13_estimating): add drywall assemblies ASM-0001 through ASM-0012
docs(_system): ratify metadata standard SYS-0003
fix(17_purchasing): correct lead time for VEN-0004
chore(_registry): rebuild document registry
```

**Types:** `feat` · `fix` · `docs` · `data` · `chore` · `refactor`

**Scope** is the domain folder (lowercased) or `_system` / `_registry` /
`_templates`.

**Rule:** one logical change per commit. A commit that both adds a standard and
migrates 40 files is two commits.

### What never gets committed

- `.env` files, API keys, tokens, passwords
- Client PII beyond what the CRM schema defines
- Original-resolution photo libraries (store references, not binaries, once
  volume grows — see the media strategy below)
- Anything with `ai_usage: human-only` that contains sensitive HR or legal detail

## Media and binary strategy

Markdown and CSV scale to tens of thousands of files in git. Photos do not.

| Volume | Approach |
|--------|----------|
| < 500 photos | Commit directly under the project folder |
| 500 – 5,000 | Git LFS |
| > 5,000 | External object storage; the OS stores a catalogue CSV (`IMG-#####`, URL, project, stage, date) and git holds only the catalogue |

The naming standard is identical in all three cases, so the migration is
mechanical.

## Review and approval flow

```
draft ──→ review ──→ approved ──→ (deprecated)
  0.x.y     0.x.y      1.0.0+
```

- AI may move a document `draft` → `review`.
- **Only the owner moves `review` → `approved`.**
- `approved` documents with `source_of_truth: true` require an explicit owner
  decision to change materially (MAJOR bump).

## Deprecation procedure

Never delete. Deprecate:

1. Set `status: deprecated` in front matter.
2. Add `superseded_by: <ID>` if a replacement exists.
3. Move the file to `10_Archive/` with the date prefix per `SYS-0004`.
4. Leave the ID retired in `_Registry/Entity_ID_Registry.csv` — never reissue.
5. Fix inbound `related:` references in the documents that pointed at it.

## Backup and recovery

| Layer | Mechanism | Frequency |
|-------|-----------|-----------|
| Primary | GitHub remote | Every push |
| Secondary | Local clone on Jimmy's machine | Weekly `git pull` |
| Tertiary | Offline archive of `_Registry` + `13_Estimating` + `21_Finance` | Quarterly |

The tertiary layer covers the irreplaceable data — cost history and financial
records. Everything else can be rebuilt; those cannot.

## Future automation ideas

- Pre-commit hook that bumps `updated` automatically when a file changes.
- CI check: `status: approved` requires `version >= 1.0.0`.
- CI check: no `.env`, key material, or oversized binary in the diff.
- Changelog generator that reads version bumps across the OS per quarter.
- Scheduled job flagging documents past `next_review`.

## AI usage notes

Bump the version on every substantive edit and say which bump you applied and
why. Never move a document to `approved` — propose it and let the owner decide.
Never edit a historical CSV row's value; add a superseding row instead.
