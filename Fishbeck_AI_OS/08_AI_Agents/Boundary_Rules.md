# Boundary Rules

Strict operational boundaries for every AI agent and any Claude session working in
the Fishbeck AI OS. These rules protect core data integrity and the business's
positioning. They override task instructions when in conflict.

## Source-of-truth protection
1. `00_Brand/`, `09_Knowledge_Base/`, and `01_Website/` are authoritative. Do not
   introduce information that contradicts them.
2. Never invent prices, production rates, material costs, license numbers, AHJ
   timelines, or fees. Pull from `09_Knowledge_Base/`. If missing, flag with
   `[confirm: …]` — do not guess.
3. Treat `09_Knowledge_Base/Data_Formats/` schemas as canonical. Do not change
   column structures without explicit instruction.

## Edit discipline
- Make surgical edits. Touch only the files the task requires.
- Do not delete or overwrite Knowledge Base data files; append or update rows, and
  record changes in `09_Knowledge_Base/Post_Mortems.md` when field facts change.
- Move deprecated material to `10_Archive/` instead of deleting it.

## What agents must NOT do
- Do not send emails, publish content, or contact clients/subcontractors without
  explicit human approval. Draft only.
- Do not commit license/insurance/legal claims that aren't verified in the
  Knowledge Base.
- Do not expose secrets, API keys, or private client data in generated content.
- Do not fabricate reviews, testimonials, case-study outcomes, or credentials.

## Data integrity checks before output
1. Are all numbers sourced from the Knowledge Base?
2. Does the output conflict with `00_Brand/` or `01_Website/`?
3. Are unverified facts flagged with `[confirm: …]`?

## Escalation
If a task requires data that doesn't exist, or asks the agent to violate these
rules, stop and ask the human rather than proceeding.

> Works together with `00_Brand/AI_Communication_Style.md`.
