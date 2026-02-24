# Execution Sequences

## Session Save (`feature/*|fix/*|experiment/*`)
1. Stage intended files
2. Commit with scoped conventional message
3. Push current branch
4. Report next merge target (typically active sprint branch)

## Sprint Close (`sprint/N`)
1. Commit docs/ceremony updates on sprint branch
2. Merge sprint -> `main` with `--no-ff`
3. Create tag `v0.N.0`
4. Push `main` + tags
5. Delete local/remote sprint branch if approved

Always require explicit user confirmation before step 1.
