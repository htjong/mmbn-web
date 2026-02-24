# Execution Sequences

## Session Save (`feature/*|fix/*|experiment/*`)
1. Stage intended files
2. Commit with scoped conventional message
3. Push current branch
4. Report next merge target (typically active sprint branch)
5. Post-close next steps:
   - Open/update merge PR into the reported target branch.
   - After merge, switch to the target branch and run integration gates (`npm run type-check`, `npm run lint`, `npm run test`).
   - Start next work from target branch using the next prioritized backlog card.

## Sprint Close (`sprint/N`)
1. Commit docs/ceremony updates on sprint branch
2. Merge sprint -> `main` with `--no-ff`
3. Create tag `v0.N.0`
4. Push `main` + tags
5. Delete local/remote sprint branch if approved
6. Post-close next steps:
   - Create and switch to the next sprint branch from updated `main`.
   - Run opening ceremony on the new sprint branch and seed changelog placeholder.
   - Resume backlog execution on that sprint branch.

Always require explicit user confirmation before step 1.
