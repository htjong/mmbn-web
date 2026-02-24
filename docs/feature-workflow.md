# Feature Workflow v3.2

A simplified, enforced workflow for turning ideas into backlog cards.

## Commands

- `$feature-explore [idea-card-path | freeform-text]`
- `$feature-formalize [idea-card-path | chosen-direction-text]`

## Outcomes

Use only these outcome statuses:
- `success`
- `needs-input`
- `blocked`
- `aborted`

## Lite/Full Tiering

- `T0`: Lite allowed (copy/UI polish only)
- `T1`: Lite allowed (local client behavior, no shared schema/protocol expansion)
- `T2`: Full required (shared logic/state/network/schema/chip/grid impact)
- Ambiguous tier defaults to `T2` and records `Tier-Reason`.

## Core Rules

- Explore requires explicit chosen-direction selection.
- Formalize cannot finalize with unresolved `RED` architecture findings.
- Reruns create versioned files by default (`.vN`).
- Overwrite requires explicit confirmation.

## Version Retention

- Active backlog keeps latest version only.
- Older versions are archived to `kanban/backlog/archive/<slug>.vN.md`.

## Legacy Policy

- One-time bulk move:
  - `kanban/ideas/*` -> `kanban/legacy/`
  - `kanban/backlog/*` -> `kanban/legacy/`
- After cutover, only new workflow outputs should live in `kanban/ideas/` and `kanban/backlog/`.
- `kanban/legacy/` is read-only archival storage.

<a id="prompt-contract"></a>
## Prompt Contract

Canonical prompt contract for `feature-explore` and `feature-formalize`.
Skills must reference `docs/feature-workflow.md#prompt-contract` and not redefine a conflicting contract.

Required 6-line interactive format:
1. `STEP:`
2. `DECISION:`
3. `RECOMMENDED:`
4. `IF RECOMMENDED:`
5. `ALTERNATIVE:`
6. `STATUS:`

Prompt rules:
- Max 140 chars per line.
- One sentence per line.
- Use only outcome statuses: `success`, `needs-input`, `blocked`, `aborted`.
- Include `Accept Recommended and Continue` for non-blocked steps.
- Present decision options as numbered choices (`1)`, `2)`, `3)`...) so users can reply with a number.
- Show expanded details only when requested, blocked, or a `RED` finding exists.
- Emit each decision prompt once per step; do not duplicate it across update/final messages.
- Emit one terminal status per completed step.

## Architecture Review Status

Use uppercase status labels only:
- `GREEN`
- `YELLOW`
- `RED`

## Validation

Run `npm run validate:prompts` before committing any changes to:
- `docs/feature-workflow.md`
- `.codex/skills/feature-explore/SKILL.md`
- `.codex/skills/feature-formalize/SKILL.md`
- `.codex/skills/feature-formalize/references/architecture-review-checklist.md`
