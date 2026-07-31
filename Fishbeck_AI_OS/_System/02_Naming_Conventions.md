---
id: SYS-0004
title: Naming Conventions
type: standard
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [governance, naming, standards]
related: [SYS-0002, SYS-0003, SYS-0006]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Naming Conventions

One name pattern per artifact type. Names are permanent contracts — renaming
breaks links, so name it right the first time.

## Universal rules

| Rule | Detail |
|------|--------|
| Character set | `A–Z a–z 0–9 _ -` only. No spaces, no `&`, no `#`, no apostrophes, no emoji. |
| Word separator (files/folders) | Underscore `_` |
| Word separator (inside a name segment) | Hyphen `-` (e.g. `1234-Main-St`) |
| Case | `Title_Case_With_Underscores` for documents and folders |
| Dates | ISO 8601 `YYYY-MM-DD`, always. Never `7/31/26`. |
| Money in data | Plain integers/decimals, no `$` or commas: `4500`, `12.75` |
| Booleans in CSV | `true` / `false` lowercase |
| Empty values in CSV | Leave blank. Use `[confirm]` only when a value is expected but unverified. |
| Max filename length | 80 characters |

## By artifact type

### Top-level domain folders
```
NN_Domain_Name/
```
`11_Executive`, `15_Construction_Knowledge`. Two digits, permanent number.

### Standard documents (narrative)
```
Title_Case_With_Underscores.md
```
`Change_Order_Process.md`, `Winter_Concrete_Placement.md`

### Registry-tracked entities (carry an ID in the filename)
```
<ID>_<Short-Title>.md
```
`SOP-0012_Rental-Turn-Process.md`, `VEN-0004_Twin-City-Supply.md`

### Templates
```
TPL_<Artifact_Type>.md
```
`TPL_SOP.md`, `TPL_Change_Order.md`

### Structured data
```
<Subject>_<Scope>.csv
```
`Unit_Pricing_Interior.csv`, `Vendor_Directory.csv`, `Historical_Costs_2026.csv`

Year-scoped data uses the year as scope: `Market_Rates_2026.csv`.

### Project folders
```
PRJ-####_<YYYY>_<City>_<Address-Or-Name>/
```
```
PRJ-0007_2026_Saint-Paul_1234-Main-St/
PRJ-0011_2026_Shakopee_Riverside-Unit-204/
```

Standard project subfolder shape:
```
PRJ-0007_2026_Saint-Paul_1234-Main-St/
├── 00_Project_Charter.md
├── 01_Estimate/
├── 02_Contracts/
├── 03_Daily_Reports/
├── 04_Photos/
├── 05_Change_Orders/
├── 06_RFIs_Submittals/
├── 07_Invoices/
├── 08_Punch_List/
└── 09_Closeout/
```

### Photos
```
<PRJ-ID>_<YYYY-MM-DD>_<area>_<stage>_<###>.jpg
```
```
PRJ-0007_2026-07-31_kitchen_before_001.jpg
PRJ-0007_2026-08-14_kitchen_progress_004.jpg
PRJ-0007_2026-09-02_kitchen_after_001.jpg
```
**Stage vocabulary (closed set):** `before` · `progress` · `after` · `defect` ·
`inspection` · `detail` · `damage` · `delivery`

### Receipts and invoices
```
<YYYY-MM-DD>_<VEN-ID>_<PRJ-ID>_<amount>.pdf
2026-07-31_VEN-0004_PRJ-0007_412-88.pdf
```
Decimal point becomes a hyphen in filenames (`412-88` = $412.88).

### Daily reports
```
<PRJ-ID>_Daily_<YYYY-MM-DD>.md
```

### Change orders / RFIs / submittals
```
<PRJ-ID>_CO-##_<Short-Title>.md
<PRJ-ID>_RFI-##_<Short-Title>.md
<PRJ-ID>_SUB-##_<Short-Title>.md
```
CO/RFI/submittal numbers restart per project and are zero-padded to 2 digits.

### Estimates
```
EST-####_<YYYY-MM-DD>_<Client-Or-Address>.md
```

### SOPs
```
SOP-####_<Short-Title>.md
```

### Meeting notes and decisions
```
<YYYY-MM-DD>_<Topic>.md
DEC-####_<Short-Title>.md        (decision records)
```

### Archived material
Move to `10_Archive/` preserving the original filename, prefixed with the
deprecation date:
```
2026-07-31_<Original_Filename>.md
```

## Reserved words

Do not use these as folder or file names: `temp`, `tmp`, `new`, `final`,
`final2`, `FINAL_v3`, `copy`, `untitled`, `misc`, `stuff`, `old`.

Versioning is handled by front matter and git — **never by filename**. There is
no `_v2` suffix in this system, ever.

## Validation checklist

- [ ] No spaces or special characters
- [ ] Dates in `YYYY-MM-DD`
- [ ] ID prefix matches `SYS-0006` registry
- [ ] Folder number matches `SYS-0002`
- [ ] Under 80 characters
- [ ] No version suffix in the name
- [ ] Filename is unique across the OS

## Future automation ideas

- Pre-commit hook rejecting filenames that fail these patterns.
- Bulk renamer that normalizes legacy files and rewrites inbound links.
- Photo intake script that reads EXIF date and auto-names to the photo pattern.
- Receipt OCR that extracts vendor + amount and emits the receipt filename.

## AI usage notes

Generate names from these patterns mechanically — do not improvise a "nicer"
name. If an existing file violates the standard, flag it in the migration map
rather than renaming it mid-task (renames break links).
