# Execution Sequences

## Session Save (`feature/*|fix/*|experiment/*`)
1. Stage intended files
2. Commit with scoped conventional message
3. Push current branch
4. Identify and report next merge target (typically active sprint branch)
5. Immediately after step 4, prompt user with: `Continue with post-close steps now?` (`Yes`/`No`)
6. If `Yes`, execute post-close steps:
   - Merge feature branch into reported target branch.
   - Run integration gates on target branch: `npm run type-check`, `npm run lint`, `npm run test`, `npm run test:e2e`.
   - If backlog-orchestrator scope changed, run orchestrator gate commands from `references/quality-gates.md`.
   - If integration gates pass, delete merged feature branch (local and remote) with explicit confirmation.
7. If `No`, stop and provide exact merge/gate/cleanup commands.

## Sprint Close (`sprint/N`)
1. Commit docs/ceremony updates on sprint branch
2. Merge sprint -> `main` with `--no-ff`
3. Create tag `v0.N.0`
4. Push `main` + tags
5. Delete local/remote sprint branch if approved
6. Post-close next steps:
   - Create and switch to the next sprint branch from updated `main`.
   - Ask user before running opening ceremony on the new sprint branch.
   - If approved, run opening ceremony and seed changelog placeholder.
   - Resume backlog execution on that sprint branch.

Always require explicit user confirmation before step 1.
