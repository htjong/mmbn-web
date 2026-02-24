---
name: feature-explore
description: Explore 3-4 distinct gameplay directions and capture one chosen direction for later formalization.
---

# Feature Explore

## Canonical Prompt Contract
- Follow `docs/feature-workflow.md#prompt-contract` exactly.
- Use only these outcome statuses: `success`, `needs-input`, `blocked`, `aborted`.
- Emit each 6-line decision prompt exactly once per step.
- Do not repeat the same prompt in both intermediary and final responses.
- Send only one terminal status response per completed step.
- Present user options as numbered choices (`1)`, `2)`, `3)`...) so the user can reply with a number.

## Intent Invariants
- Stay in gameplay design space; do not perform implementation planning.
- Generate genuinely distinct directions (not cosmetic variants).
- Persist exactly one chosen direction to `kanban/ideas`.
- Existing chosen direction replacement requires explicit confirmation.

## Workflow
1. Resolve input (idea card path or freeform text).
2. Produce 3-4 distinct directions using `references/chosen-direction-template.md`.
3. Guide selection with the canonical 6-line prompt format and numbered options.
4. Persist chosen direction in an existing/new idea card.
5. Emit terminal status (`success`, `needs-input`, `blocked`, `aborted`).
6. Hand off to `feature-formalize` when requested.
