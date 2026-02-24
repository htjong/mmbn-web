# Orchestrator Contract

## Run Outcomes
Allowed terminal outcomes:
- `success`
- `needs-input`
- `blocked`
- `aborted`

## Card States
- `queued`
- `intake_failed`
- `analyzing`
- `implementing`
- `validating`
- `reviewing`
- `packaging`
- `ready-for-pr`
- `blocked`
- `failed`

## Mandatory Stage Order
1. `intake`
2. `assumption_snapshot`
3. `tdd_red`
4. `tdd_green`
5. `tdd_refactor`
6. `validating`
7. `reviewing`
8. `assumption_diff`
9. `packaging`

## Fail-Closed Rules
- Execute mode must have non-empty git diff.
- Execute mode must include key-file overlap unless explicit override is set.
- Every AC must include `unit`, `integration`, `storybook`, `e2e` artifacts.
- Every AC must include `tdd_proof.red|green|refactor`.
- Any unresolved architecture `RED` blocks finalization.
- Any unresolved `critical|major` review finding blocks finalization.
- Any unexplained assumption diff blocks finalization.

## Exit Code Contract
- `0`: every processed card is `ready-for-pr`.
- `1`: any card is `blocked`, `failed`, or `intake_failed`.
- `1`: dry mode runs (non-ready by design).

## Human Input Exceptions
Human input is requested only for:
- ambiguous dependency ordering
- conflicting AC interpretation
- unsafe broad-scope implementation requirement

Prompts must follow `docs/feature-workflow.md#prompt-contract`.
