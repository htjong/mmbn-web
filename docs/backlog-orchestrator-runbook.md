# Backlog Orchestrator Runbook

This runbook documents the exact workflow used to go from planning to implementation, debugging, and readiness for backlog cards.

## 1. Plan the card execution

1. Confirm backlog card exists in `kanban/backlog/`.
2. Confirm card has required sections:
   - `Mode`
   - `Description`
   - `Acceptance Criteria`
   - `Notes` (with `Key files`)
   - `Architecture Review`
3. Confirm architecture has no unresolved `RED` findings.

## 2. Prepare AC evidence manifest (before execute mode)

1. Create/update `kanban/backlog/evidence/<card-id>.json`.
2. Add one `ac_trace` entry per AC (`AC1`, `AC2`, ...).
3. For each AC, include all required layers:
   - `unit`
   - `integration`
   - `storybook`
   - `e2e`
4. Add `tdd_proof` fields:
   - `red`
   - `green`
   - `refactor`
5. Add `assumption_diff_reasons` entries for expected touched/non-touched files.

Template reference:
- `.codex/skills/backlog-orchestrate/references/evidence-manifest-template.json`

## 3. Implement with TDD in key files

1. Start from key files listed in the backlog card `Notes`.
2. Red: add failing tests/spec coverage for AC.
3. Green: implement minimal code to satisfy AC.
4. Refactor: clean up while preserving behavior.
5. Ensure changes map back to evidence manifest file paths.

## 4. Run orchestrator and debug gates

Dry run:

```bash
npm run orchestrate:backlog
```

Execute a single card:

```bash
node scripts/backlog-orchestrate.mjs --mode execute --card kanban/backlog/<card-file>.md
```

If blocked/failed:

1. Open `kanban/reports/<card-id>.run-report.json`.
2. Read:
   - `blocked_reason`
   - `stage_history`
   - `commands`
   - `assumptions_diff`
3. Fix the failing gate only, rerun, repeat.

Common blockers:

1. Missing artifacts referenced in `ac_trace` paths.
2. Missing key-file overlap in actual diff.
3. Validation command failure (`lint`, `type-check`, test commands).
4. E2E setup issues (Playwright install/browser install).
5. Unexplained assumption diffs.

## 5. Required local validation

At minimum, pass:

```bash
npm run lint
npm run type-check
npm run test:client
npm run test:e2e:card -- --grep <card-id>
```

Then rerun orchestrator execute mode for the card.

## 6. Ready-for-PR criteria

Card is done only when run report shows:

1. `state = ready-for-pr`
2. all stages passed through packaging
3. all AC traces have full 4-layer evidence
4. assumption diffs are fully explained
5. no unresolved critical/major review findings

Artifacts to review:

1. `kanban/reports/<card-id>.run-report.json`
2. `kanban/reports/<card-id>.pr.md`

## 7. Related docs

1. Workflow: `docs/backlog-orchestrator-workflow.md`
2. Skill: `.codex/skills/backlog-orchestrate/SKILL.md`
3. Contract: `.codex/skills/backlog-orchestrate/references/orchestrator-contract.md`
4. Schema: `.codex/skills/backlog-orchestrate/references/run-report-schema.json`
