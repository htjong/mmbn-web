# Branch Cases

## Classification
- `sprint/N`: active sprint integration branch
- `feature/*`, `fix/*`, `experiment/*`: sub-branch mode
- `main`: no active sprint or special case
- other: unknown branch, warn user

## Special Checks
- Sprint already merged into `origin/main`
- Sub-branch commit distance vs parent sprint
- No open sprint branch available

## Actions
- Already on correct branch: continue
- Needs isolated work from sprint: create `feature/*` or `fix/*`
- PM/docs-only work on sprint branch: no sub-branch
- Needs new sprint: compute next sprint number and create `sprint/N`
