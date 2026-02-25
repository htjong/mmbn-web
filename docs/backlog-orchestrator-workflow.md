# Backlog Orchestrator Workflow

## Purpose
Automate delivery of active backlog cards through fail-closed gates that require real implementation proof plus AC-level unit, integration, storybook, and e2e evidence.

## Quick Start
1. Dry run (always non-ready by design):
- `npm run orchestrate:backlog`
2. Provide per-card evidence manifest:
- `kanban/backlog/evidence/<card-id>.json`
3. Execute mode:
- `npm run orchestrate:backlog:execute`
4. Single-card execute mode:
- `node scripts/backlog-orchestrate.mjs --mode execute --card kanban/backlog/<card-file>.md`

## Active Card Discovery
- Include: `kanban/backlog/*.md`
- Exclude: `kanban/backlog/archive/*`, `.gitkeep`

## Mandatory Evidence Manifest
Each card in execute mode must provide `kanban/backlog/evidence/<card-id>.json` with:
- `ac_trace[]` entries keyed by `ac_id`
- 4-layer artifact refs per AC: `unit`, `integration`, `storybook`, `e2e`
- `tdd_proof.red|green|refactor` per AC
- `assumption_diff_reasons` object keyed by file path

## Stage Order
1. `intake`
2. `assumption_snapshot`
3. `tdd_red`
4. `tdd_green`
5. `tdd_refactor`
6. `validating`
7. `reviewing`
8. `assumption_diff`
9. `packaging`

## Hard Gates
- Missing required card sections -> `intake_failed`
- Missing key files -> `blocked`
- Unresolved architecture `RED` -> `blocked`
- Missing/invalid AC evidence manifest -> `blocked`
- Missing git diff in execute mode -> `blocked`
- No key-file overlap in changed files (without override) -> `blocked`
- Validation/test command failure -> `failed`
- Unresolved `critical|major` review findings -> `blocked`
- Unexplained assumption diff entries -> `blocked`

## Validation Commands
- Always run:
- `npm run lint`
- `npm run type-check`
- Tests selected by changed-file scope (`test:client`, `test:server`, or full `test`)
- Card e2e run:
- `npm run test:e2e:card -- --grep <card-id>`

## Assumption Review and Diff
At start:
- snapshot key files from card Notes
- review each key file and record coverage

At end:
- diff touched files against initial key-file assumptions
- classify as `same` or `different`
- require reason for every `different` entry

## Output Artifacts
- Per-card report JSON:
- `kanban/reports/<card-id>.run-report.json`
- Per-card PR payload markdown:
- `kanban/reports/<card-id>.pr.md`

## Exit Codes
- `0`: all processed cards are `ready-for-pr`
- `1`: any card is non-ready (`blocked`, `failed`, `intake_failed`) or run is dry mode
