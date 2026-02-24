---
name: work-ceremony-closing
description: Run session closing ceremony for this repo - execute quality gates, audit and analyze changes, update living docs, and perform branch-appropriate close actions (session save or sprint close). Use when ending a development session.
---

# Work Ceremony Closing

## Intent Invariants
- Execute gates in required order and stop on blocking failures.
- Separate sprint-close flow from feature/fix session-save flow.
- Require explicit user confirmation before commit/merge/tag/push.
- Require explicit user confirmation before terminating processes to remediate gate failures.
- Require explicit user confirmation before deleting local/remote branches.
- Require explicit user confirmation before running opening ceremony on a newly created sprint branch.
- Do not bypass critical findings from analysis.

## Claude -> Codex Compatibility Map
- Legacy `/work:ceremony-closing` command -> skill workflow.
- Legacy delegated analyses (`analyze-file`, `analyze-code`, `test-runner`) -> run equivalent analyses directly or through corresponding Codex skills.
- Legacy progress context updates -> `.codex/context/progress.md` updates.

## Workflow
1. **Branch mode preamble:** classify branch and announce close mode.
2. **Quality gates:** run steps from `references/quality-gates.md` in strict order; stop on blockers.
3. **Gate remediation (conditional):** when blockers are port/process conflicts, ask for explicit confirmation before terminating processes; if approved, rerun only failed/blocked gates.
4. **Change audit:** collect `git status`, diff, commit range; determine code-changed vs docs-only.
5. **Code analysis gate:** run `analyze-code` equivalent when code changed; stop on critical findings.
6. **Change summary:** produce intent-level bullets of what changed and why.
7. **Documentation updates:** changelog, plan AC checks, context progress, and card cleanup using templates in references.
8. **Confirmation gate:** present planned commit/merge/tag actions and wait for explicit approval.
9. **Execution:** perform session-save or sprint-close sequence from `references/execution-sequences.md`.
10. **Post-close handoff:** offer to execute post-close steps automatically; run only after explicit user confirmation, otherwise report exact next commands and stop.

## Output Contract
- Must include gate results, change audit, analysis outcome, proposed doc updates, explicit execution plan, and post-close next steps (executed or explicitly deferred).
