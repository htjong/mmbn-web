---
name: backlog-orchestrate
description: Orchestrate analysis, TDD implementation, validation, and code review for active backlog cards with fail-closed gates.
---

# Backlog Orchestrate

## Canonical Prompt Contract
- Follow `docs/feature-workflow.md#prompt-contract` for any human decisions.
- Use only terminal statuses: `success`, `needs-input`, `blocked`, `aborted`.

## Intent Invariants
- Process active `kanban/backlog/*.md` cards only (exclude archive).
- Never mark a card complete without real code diff in execute mode.
- Never auto-pass ACs with placeholder evidence.
- Require AC-level evidence for `unit`, `integration`, `storybook`, and `e2e`.
- Require TDD evidence (`red`, `green`, `refactor`) per AC.
- Require key-file assumption snapshot and end-of-run assumption diff explanations.
- Block on unresolved architecture `RED` and unresolved `critical|major` review findings.
- Never auto-merge.

## Workflow
1. Intake: parse card and required sections.
2. Assumption snapshot: review all key files listed in card notes.
3. TDD evidence validation: verify evidence manifest and per-AC 4-layer artifacts.
4. Implementation proof: verify git diff exists and overlaps key files (unless explicitly allowed).
5. Validation: lint, type-check, targeted tests, and e2e card run.
6. Review: run static review checks over changed files and enforce severity gate.
7. Assumption diff: compare touched files vs initial assumptions and require reasons for differences.
8. Packaging: emit report + PR payload artifact.

## Output Contract
- Per-card report JSON must validate `references/run-report-schema.json`.
- PR payload must follow `references/pr-template-section.md`.
- Stage/state behavior must follow `references/orchestrator-contract.md`.
