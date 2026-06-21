# Fishbeck AI OS

The single source of truth for **Fishbeck Innovations LLC** — a construction and
property maintenance company serving the Twin Cities, Minnesota.

This is not just a folder structure. It is a living system that Claude
continuously updates and uses to generate website content, social content,
newsletters, digital products, and future SaaS documentation.

## How to use this

1. Before creating anything, Claude reads `00_Brand/` for identity and voice.
2. For website work, Claude edits files in `01_Website/`.
3. For facts, pricing, and how-we-work details, Claude pulls from `09_Knowledge_Base/`.

If only `00_Brand`, `01_Website`, and `09_Knowledge_Base` are kept accurate and
up to date, Claude can manage roughly 80% of the website and content workload.

## Root structure

| Folder | Purpose |
|--------|---------|
| `00_Brand` | Master business identity, messaging, and Claude's operating instructions |
| `01_Website` | Live website content — pages, services, service areas, landing pages, blog |
| `02_SEO` | Keywords, local SEO, competitors, search intent, internal linking |
| `03_Content` | Content engine — YouTube, Shorts, LinkedIn, Facebook, GBP, newsletter, blog |
| `04_Case_Studies` | Real project write-ups, the raw material for content and proof |
| `05_Digital_Products` | Packs and templates sold or given as lead magnets |
| `06_Sales_Marketing` | Capability statements, one-pagers, email templates, lead magnets |
| `07_SaaS` | Future software products — PRDs, flows, features |
| `08_AI_Agents` | Instruction sets Claude follows for specific jobs |
| `09_Knowledge_Base` | Claude's brain — pricing, estimating, production rates, SOPs, codes |
| `10_Archive` | Deprecated/old material kept for reference |

## Source of truth rules

- `00_Brand`, `01_Website`, and `09_Knowledge_Base` are authoritative.
- Do not create conflicting information across files.
- When facts change (pricing, services, service area), update the Knowledge Base
  first, then propagate to website and content.

See `00_Brand/Claude_Project_Instructions.md` for the full operating contract.
