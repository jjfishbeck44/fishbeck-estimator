---
id: SYS-0001
title: Fishbeck OS Charter
type: charter
domain: _System
status: approved
version: 1.0.0
owner: Jimmy Fishbeck
created: 2026-07-31
updated: 2026-07-31
review_cycle: annual
next_review: 2027-07-31
tags: [governance, architecture, foundation]
related: [SYS-0002, SYS-0003, SYS-0009]
source_of_truth: true
ai_usage: read-only
confidence: high
---

# Fishbeck OS Charter

The constitution of the operating system. Every other file in this repository is
subordinate to this document and to the standards it ratifies.

## Purpose

Build and maintain the single source of truth for **Fishbeck Innovations LLC** —
a system where every estimate, receipt, invoice, project, employee, SOP,
inspection photo, production rate, vendor, AI prompt, building code, and workflow
has exactly one correct location, one owner, and one machine-readable identity.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Company knowledge, data, standards, workflows, and templates | Live customer PII and payment credentials (see `24_Legal_Risk`) |
| Structured databases (CSV) that feed apps and AI | Application source code (lives in `/api`, `/lib`, `/public`) |
| Governance for how the OS grows | Ephemeral chat logs and scratch work |
| Documentation of automations | Secrets, API keys, `.env` values — **never** committed |

## The Ten Principles

1. **One fact, one home.** Any given fact lives in exactly one file. Everywhere
   else references it by ID. Duplication is a defect, not a convenience.
2. **Systems over documents.** If a deliverable could be a template, database, or
   checklist, it must not be a one-off document.
3. **Machine-readable first.** Structured data lives in CSV with stable IDs.
   Narrative lives in Markdown with YAML front matter. Nothing important lives
   only in prose.
4. **Every file is addressable.** Every document carries an ID and metadata per
   `SYS-0003`. Unaddressable files are treated as drafts.
5. **Dependency order.** Never build a system whose inputs do not yet exist.
   Standards precede templates; templates precede content; content precedes
   analytics.
6. **Minnesota code compliant.** Anything touching means and methods is checked
   against `15_Construction_Knowledge/Minnesota_Codes` and cites the code section.
7. **Version controlled.** Git is the audit trail. Semantic versions in front
   matter. Superseded material is deprecated, never silently deleted.
8. **Automation first.** Every system documents the automation it is waiting for.
   Manual steps are technical debt and are logged in the Automation Backlog.
9. **Improve before adding.** Extend an existing system before creating a new one.
   A new top-level domain requires an explicit amendment to `SYS-0002`.
10. **Compounding, not rushing.** This is a multi-year asset. Correctness and
    consistency outrank speed on every single decision.

## Governance

| Role | Holder | Authority |
|------|--------|-----------|
| Owner / final approver | Jimmy Fishbeck | Approves standards, pricing, and any structural change |
| System steward | AI assistant (any model) | Proposes, drafts, maintains consistency, flags conflicts |
| Domain owners | Assigned per domain in `SYS-0002` | Accuracy of their domain's contents |

**Change control.** Structural changes — new top-level domain, new ID prefix,
changed CSV schema, changed metadata field — require an entry in
`_System/Decision_Log.md` and a version bump on the affected standard. Additive
changes (new rows, new documents in an existing folder) need no ceremony.

## Ratified standards

| ID | Standard | File |
|----|----------|------|
| SYS-0002 | Architecture Master | `01_Architecture_Master.md` |
| SYS-0003 | Metadata Standard | `03_Metadata_Standard.md` |
| SYS-0004 | Naming Conventions | `02_Naming_Conventions.md` |
| SYS-0005 | Taxonomy & Tags | `04_Taxonomy_and_Tags.md` |
| SYS-0006 | ID Registry Standard | `05_ID_Registry_Standard.md` |
| SYS-0007 | Version Control Standard | `06_Version_Control_Standard.md` |
| SYS-0008 | Document Lifecycle | `07_Document_Lifecycle.md` |
| SYS-0009 | AI Operating Protocol | `08_AI_Operating_Protocol.md` |
| SYS-0010 | Build Roadmap | `09_Build_Roadmap.md` |
| SYS-0011 | Migration Map | `10_Migration_Map.md` |

## Success criteria

The OS is working when:

- A new employee can find any procedure in under 60 seconds.
- Any AI assistant can answer a company question with a cited file ID.
- An estimate can be traced to the production rates and material costs behind it.
- A completed project produces its own case study, lessons learned, and cost
  history rows with no re-keying.
- No number in the company exists in two places with two values.

## Future automation ideas

- CI check that validates YAML front matter on every `.md` file in the OS.
- CI check that every ID referenced in `related:` actually exists.
- Nightly job that rebuilds `_Registry/Document_Registry.csv` from front matter.
- Embedding index over the OS for semantic search by any AI agent.

## AI usage notes

Read this file first in any session that touches the OS. Do not modify it without
explicit instruction from the owner. When a request conflicts with a principle
here, say so before proceeding.
