---
id: SYS-0006
title: ID Registry Standard and Entity Relationships
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: quarterly
next_review: 2026-10-31
tags: [governance, database, standard, ai-searchable]
related: [SYS-0002, SYS-0003, SYS-0004]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# ID Registry Standard and Entity Relationships

IDs are the joins of the entire company. They turn a pile of documents into a
relational database that any AI or future app can traverse.

## ID format

```
<PREFIX>-<NUMBER>
```

- **Prefix:** 2–4 uppercase letters, from the closed list below.
- **Number:** zero-padded. 4 digits standard (`0001`); 5 digits for
  high-volume entities (photos, receipts, documents).
- **Immutable.** An ID is never reused, never renumbered. Deleting an entity
  means marking it `deprecated` — the ID stays retired forever.
- **Sequential.** Next available number comes from
  `_Registry/Entity_ID_Registry.csv`, which must be updated in the same commit.

## Prefix register

### Core business entities

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `PRJ` | Project / job | `14_Projects` | 4 |
| `CLI` | Client | `20_CRM` | 4 |
| `LED` | Lead | `20_CRM` | 4 |
| `PRP` | Property | `23_Real_Estate` | 4 |
| `VEN` | Vendor / supplier | `17_Purchasing` | 4 |
| `SUB` | Subcontractor | `17_Purchasing` | 4 |
| `EMP` | Employee / crew member | `19_HR` | 4 |
| `EQP` | Equipment / tool asset | `18_Equipment` | 4 |
| `PTR` | Referral partner | `20_CRM` | 4 |

### Transactions and documents

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `EST` | Estimate | `13_Estimating` | 4 |
| `PRO` | Proposal | `06_Sales_Marketing` | 4 |
| `CON` | Contract | `24_Legal_Risk` | 4 |
| `CO` | Change order | `14_Projects` (per-project seq) | 2 |
| `INV` | Invoice | `21_Finance` | 4 |
| `RCT` | Receipt | `21_Finance` | 5 |
| `PO` | Purchase order | `17_Purchasing` | 4 |
| `RFI` | Request for information | `14_Projects` (per-project seq) | 2 |
| `SBM` | Submittal | `14_Projects` (per-project seq) | 2 |
| `DR` | Daily report | `14_Projects` (per-project, by date) | — |

### Knowledge and standards

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `SYS` | System standard | `_System` | 4 |
| `SOP` | Standard operating procedure | `12_Operations` | 4 |
| `POL` | Policy | `19_HR` / `24_Legal_Risk` | 4 |
| `CHK` | Checklist | `16_Quality` / `12_Operations` | 4 |
| `TPL` | Template | `_Templates` | name-based |
| `CODE` | Code reference | `15_Construction_Knowledge` | 4 |
| `DTL` | Typical detail | `15_Construction_Knowledge` | 4 |
| `SPEC` | Manufacturer spec | `15_Construction_Knowledge` | 4 |
| `DEC` | Decision record | `_System` | 4 |

### Estimating data

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `ASM` | Assembly (composite unit of work) | `13_Estimating/Assemblies` | 4 |
| `MAT` | Material line | `13_Estimating/Material_Database` | 4 |
| `LAB` | Labor rate | `13_Estimating/Labor_Database` | 4 |
| `PRD` | Production rate | `13_Estimating/Production_Rates` | 4 |
| `UP` | Unit price | `13_Estimating/Unit_Pricing` | 4 |
| `HC` | Historical cost record | `13_Estimating/Historical_Costs` | 5 |

> `PRD-####` is already in use in
> `09_Knowledge_Base/Data_Formats/Production_Rates_Template.csv` and is
> preserved unchanged by the migration.

### Quality and analytics

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `DEF` | Defect library entry | `16_Quality/Defect_Library` | 4 |
| `LL` | Lessons learned | `16_Quality/Lessons_Learned` | 4 |
| `RCA` | Root cause analysis | `16_Quality/Root_Cause` | 4 |
| `PL` | Punch list item | `14_Projects` (per-project) | 3 |
| `KPI` | Key performance indicator | `11_Executive` | 3 |
| `OKR` | Objective / key result | `11_Executive` | 3 |

### AI and automation

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `PMT` | Prompt library entry | `08_AI_Agents/Prompt_Library` | 4 |
| `AGT` | AI agent definition | `08_AI_Agents` | 3 |
| `AUT` | Automation (built or backlog) | `08_AI_Agents/Automation` | 3 |
| `SCR` | Script | `08_AI_Agents/Scripts` | 3 |

### Media

| Prefix | Entity | Home | Digits |
|--------|--------|------|--------|
| `IMG` | Catalogued photo | `14_Projects` / `16_Quality` | 5 |
| `CS` | Case study | `04_Case_Studies` | 3 |

## Entity relationship model

```
                          PRP (property)
                            │
LED (lead) ──converts──→ CLI (client) ──owns──→ PRJ (project)
                                                  │
        ┌──────────────┬────────────┬─────────────┼──────────────┬────────────┐
        │              │            │             │              │            │
      EST           CON/CO         DR           INV/RCT        PL/DEF       IMG
   (estimate)     (contract)    (daily)       (finance)      (quality)    (photos)
        │                                          │              │
        │                                          │              └→ LL / RCA
        │                                          │
        │                                          └→ HC (historical cost)
        │                                                    │
        ├── built from ──→ ASM ──composed of──→ MAT + LAB + PRD
        │                                              ▲
        └──────────── feedback loop ───────────────────┘
                    (actuals recalibrate rates)

VEN/SUB ──supplies──→ PO ──→ PRJ          EMP ──works on──→ PRJ
   │                                        │
   └→ vendor performance (22_Analytics)     └→ EQP (equipment assigned)
```

### Join rules

| Relationship | Implemented as |
|--------------|----------------|
| Project → Client | `client_id` in project front matter |
| Estimate → Project | `project_id` in estimate front matter |
| Invoice → Project | `project_id` column in `21_Finance` CSV |
| Receipt → Vendor + Project | `vendor_id` + `project_id` columns |
| Assembly → Materials/Labor | `component_ids` column (pipe-delimited) |
| Historical cost → Estimate | `estimate_id` column — enables accuracy scoring |
| Lessons learned → Project | `project_id` in front matter |
| Photo → Project | Filename prefix (see `SYS-0004`) |

**Multi-value columns** in CSV use pipe delimiters, never commas:
`component_ids: MAT-0012|MAT-0034|LAB-0003`

## Domain index IDs — the `-0000` convention

**`<CODE>-0000` is reserved for a domain's own README.** It is never issued to a
business entity, so `EXEC-0001` and `EXEC-0000` can never collide. Every domain
README carries its domain index ID:

| Code | Domain | Code | Domain |
|------|--------|------|--------|
| `SYS-0000` | `_System` | `PUR-0000` | `17_Purchasing` |
| `EXEC-0000` | `11_Executive` | `EQP-0000` | `18_Equipment` |
| `OPS-0000` | `12_Operations` | `HR-0000` | `19_HR` |
| `EST-0000` | `13_Estimating` | `CRM-0000` | `20_CRM` |
| `PRJ-0000` | `14_Projects` | `FIN-0000` | `21_Finance` |
| `CK-0000` | `15_Construction_Knowledge` | `ANL-0000` | `22_Analytics` |
| `QLT-0000` | `16_Quality` | `RE-0000` | `23_Real_Estate` |
| | | `LEG-0000` | `24_Legal_Risk` |

Note that `EST-0000` and `PRJ-0000` reuse the estimate and project prefixes at
number `0000` — this is safe precisely because `0000` is never issued to an
estimate or a project.

## Reserved and retired IDs

| ID range | Status | Reason |
|----------|--------|--------|
| `SYS-0000` … `SYS-0014` | Assigned | Foundation standards, registries, templates index |
| `DEC-0001` … `DEC-0010` | Assigned | Phase 0 structural decisions |
| `AUT-001` … `AUT-009` | Assigned | Seeded automation backlog |
| `PRD-0001` … `PRD-0004` | Assigned | Existing production rate template rows |
| Any `-0000` | Reserved | Domain index only; never issued to an entity |

## Issuing a new ID — procedure

1. Open `_Registry/Entity_ID_Registry.csv`.
2. Find the row for the prefix; read `next_number`.
3. Use that number; zero-pad per this standard.
4. Increment `next_number` and update `last_issued` and `last_updated`.
5. Commit the registry change **with** the new artifact — never separately.

## Future automation ideas

- `issue-id.js <PREFIX>` — atomically reserves the next ID and prints it.
- CI check for duplicate IDs across the OS.
- CI check that every `related:` and every `*_id` column resolves.
- Graph export (nodes = entities, edges = joins) for visualizing the company.
- Migration of the registries from CSV to SQLite/Postgres once volume demands it —
  the schema here is already relational, so the port is mechanical.

## AI usage notes

Never invent an ID. Always read `_Registry/Entity_ID_Registry.csv` first, then
increment it in the same change. If you cannot update the registry, do not
create the artifact — an unregistered ID corrupts the join graph.
