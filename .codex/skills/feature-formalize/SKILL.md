---
name: feature-formalize
description: Formalize a chosen direction into an implementable backlog card with ACs and architecture risk checks.
---

# Feature Formalize

## Canonical Prompt Contract
- Follow `docs/feature-workflow.md#prompt-contract` exactly.
- Use only these outcome statuses: `success`, `needs-input`, `blocked`, `aborted`.
- Emit each 6-line decision prompt exactly once per step.
- Do not repeat the same prompt in both intermediary and final responses.
- Send only one terminal status response per completed step.
- Present user options as numbered choices (`1)`, `2)`, `3)`...) so the user can reply with a number.

## Intent Invariants
- Require a concrete chosen direction before drafting.
- Resolve risk tier (`T0`, `T1`, `T2`) before writing.
- Enforce mode rules: `T0/T1` can use Lite; `T2` requires Full.
- Produce testable acceptance criteria and run architecture checks before finalization.
- Do not finalize if any architecture category is unresolved `RED`.
- Default reruns to versioned outputs (`.vN`); overwrite requires explicit confirmation.

## Workflow
1. Resolve chosen direction from card path or user text.
2. Classify risk tier (`T0`, `T1`, `T2`), default ambiguous cases to `T2`, and record `Tier-Reason`.
3. Ask clarifying questions using the canonical 6-line prompt format with numbered options.
4. Draft backlog card with `references/backlog-card-template.md`.
5. Run `references/architecture-review-checklist.md` and produce structured `GREEN|YELLOW|RED` output.
6. If unresolved `RED` exists, emit `blocked` and stop finalization.
7. Save final card to `kanban/backlog/` (latest active) and archive prior versions to `kanban/backlog/archive/`.
8. Emit terminal status (`success`, `needs-input`, `blocked`, `aborted`).

## Output Contract
- Backlog card follows template and includes key-file notes.
- Architecture review uses uppercase statuses: `GREEN`, `YELLOW`, `RED`.
