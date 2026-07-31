---
id: TPL-DATABASE-SCHEMA
title: Template — Database Schema Documentation
type: template
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [template, database, standard, ai-searchable]
related: [SYS-0003, SYS-0006, SYS-0007]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Template — Database Schema Documentation

Copy below the line into `NN_Domain/_Data/README.md`.

CSVs cannot carry YAML front matter, so **every `_Data/` folder must have this
README.** An undocumented CSV is an unusable CSV.

---

```yaml
---
id: <DOMAIN>-DATA
title: <Domain> — Data Schemas
type: database
domain: NN_Domain
status: draft
version: 0.1.0
owner: Jimmy Fishbeck
created: YYYY-MM-DD
updated: YYYY-MM-DD
review_cycle: quarterly
next_review: YYYY-MM-DD
tags: [database, <function>]
related: [SYS-0006]
source_of_truth: true
ai_usage: read-write
confidence: high
---
```

# <Domain> — Data Schemas

## Files

| File | Purpose | ID prefix | Rows | Update cadence |
|------|---------|-----------|------|----------------|
| `<name>.csv` | | `XXX-####` | | |

## Schema — `<name>.csv`

| Column | Type | Required | Description | Example | Constraints |
|--------|------|----------|-------------|---------|-------------|
| `id` | string | yes | Primary key | `MAT-0001` | Unique; prefix per `SYS-0006` |
| | | | | | |
| `status` | enum | yes | Row state | `active` | `active`/`inactive`/`deprecated` |
| `source` | string | yes | Where the value came from | `Menards quote 2026-07` | |
| `confidence` | enum | yes | Verification level | `high` | Per `SYS-0003` |
| `last_updated` | date | yes | Last change | `2026-07-31` | `YYYY-MM-DD` |
| `notes` | string | no | Free text | | |

The last five columns are mandatory on every CSV in the OS (`SYS-0003`).

## Conventions

- Currency: plain numbers, no `$` or commas — `4500`, `12.75`
- Units: explicit and from a closed set — `sf`, `lf`, `sy`, `cy`, `ea`, `hr`, `day`
- Dates: `YYYY-MM-DD`
- Booleans: `true` / `false`
- Multi-value cells: **pipe-delimited** (`MAT-0012|MAT-0034`), never commas (`DEC-0008`)
- Empty: leave blank; use `[confirm]` only for an expected-but-unverified value

## Relationships

| This column | Joins to | Cardinality |
|-------------|----------|-------------|
| `<column>` | `<file>.<column>` | many-to-one |

## Row versioning

Per `SYS-0007`: **never edit a historical value in place.** Deprecate the row and
add a superseding row with a new ID and `effective_date`. This is what keeps past
estimates reproducible.

## Consumers

| Consumer | How it uses this data | Sync method |
|----------|----------------------|-------------|
| | | manual / generated |

Anything listed here must be regenerated when this data changes.

## Validation rules

- [ ] Every `id` unique
- [ ] Every foreign key resolves
- [ ] No `active` row with `confidence: unverified` used in client-facing output
- [ ] `price_low <= price_high` where applicable
- [ ] Units drawn from the closed set

## Future automation ideas

- CSV schema validator in CI.
- Referential integrity check across all registries.
- Migration to SQLite when rows exceed ~5,000.

## AI usage notes

Read this README before reading or writing the CSV. Never add a column without a
`DEC-####` record. Never quote a row whose `confidence` is `low` or `unverified`
to a client.
