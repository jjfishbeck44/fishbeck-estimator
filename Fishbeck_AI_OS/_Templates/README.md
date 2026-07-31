---
id: SYS-0014
title: _Templates — Reusable Document Skeletons
type: readme
domain: _Templates
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: semiannual
next_review: 2027-01-31
tags: [template, governance, index, standard]
related: [SYS-0003, SYS-0008]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# _Templates — Reusable Document Skeletons

Charter principle #2: **systems over documents.** Never write a one-off when a
template exists. Never write a second one-off — build the template first.

## Template library

| Template | Produces | Lands in | ID prefix |
|----------|----------|----------|-----------|
| `TPL_SOP.md` | Standard operating procedure | `12_Operations/SOP_Library/` | `SOP-####` |
| `TPL_Checklist.md` | Verification checklist | `16_Quality/QC_Checklists/` | `CHK-####` |
| `TPL_Policy.md` | Policy | `19_HR/` · `24_Legal_Risk/` | `POL-####` |
| `TPL_Project_Charter.md` | Project index | `14_Projects/PRJ-####_.../` | `PRJ-####` |
| `TPL_Daily_Report.md` | Daily field report | `14_Projects/.../03_Daily_Reports/` | `DR-<date>` |
| `TPL_Change_Order.md` | Change order | `14_Projects/.../05_Change_Orders/` | `CO-##` |
| `TPL_RFI.md` | Request for information | `14_Projects/.../06_RFIs_Submittals/` | `RFI-##` |
| `TPL_Estimate.md` | Estimate | `13_Estimating/Estimates/` | `EST-####` |
| `TPL_Vendor_Record.md` | Vendor / sub record | `17_Purchasing/Vendor_Database/` | `VEN-####` · `SUB-####` |
| `TPL_Lessons_Learned.md` | Lessons learned | `16_Quality/Lessons_Learned/` | `LL-####` |
| `TPL_Root_Cause.md` | Root cause analysis | `16_Quality/Root_Cause/` | `RCA-####` |
| `TPL_Decision_Record.md` | Decision record | `_System/` | `DEC-####` |
| `TPL_Database_Schema.md` | CSV schema documentation | `NN_Domain/_Data/README.md` | — |
| `TPL_Domain_README.md` | Domain README | `NN_Domain/README.md` | — |

## Templates living elsewhere

Per Charter principle #1 (one fact, one home), these are **not** duplicated here:

| Template | Location | Note |
|----------|----------|------|
| Case study | `04_Case_Studies/Template.md` | Predates this library; migrates here in Phase 1.1 as `TPL_Case_Study.md` |
| Bid structure | `06_Sales_Marketing/Bid_Templates/_Bid_Structure.md` | Reconcile with `TPL_Estimate.md` in Phase 2.7 |
| CSV schemas | `09_Knowledge_Base/Data_Formats/` | Moves to `13_Estimating/_Data/` in Phase 1.1 |

## How to use a template

1. Confirm no existing document covers the need (`SYS-0008` stage 1).
2. Issue an ID from `_Registry/Entity_ID_Registry.csv`; increment `next_number`.
3. Copy **everything below the horizontal rule** into the target path.
4. Replace the fenced YAML block with real front matter — the fence is there so
   the template's own metadata doesn't confuse parsers.
5. Name the file per `SYS-0004`.
6. Fill every section, or mark it `N/A` with a reason. Never leave placeholders.
7. Add a row to `_Registry/Document_Registry.csv`.
8. Set `status: draft`. Only Jimmy sets `approved`.

## Template design rules

Templates in this library:

- Carry their own valid front matter (`type: template`) so they're registrable.
- Put the **instance** front matter inside a fenced ```yaml block.
- Separate guidance from the copyable body with a `---` horizontal rule.
- Include `Future automation ideas` and `AI usage notes` sections, per the
  standards required by the Charter.
- Explain *why* a section exists where the reason isn't obvious — a template
  nobody understands gets filled out badly.

## Changing a template

Template changes don't retroactively change existing documents. Bump the
template version, and if the change is material (MAJOR), note in the roadmap
whether existing instances need updating.

## Future automation ideas

- `new-doc.js <template> <target>` — copies, issues the ID, stamps front matter,
  and registers the document in one command.
- Completeness linter that flags unfilled `<placeholders>` in non-template files.
- Template usage analytics: which templates are used, which are ignored (an
  ignored template is a design problem).

## AI usage notes

Always check this library before authoring anything. If nothing fits, **build
the template first, then the instance** — that is the difference between building
a system and writing a document.
