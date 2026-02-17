# Git Branching Strategy

> **Strategy:** Modified GitHub Flow optimized for rapid game development iteration
>
> **Principles:**
> - Main branch is always deployable
> - Short-lived feature branches (1-3 days max)
> - Fast merges to unblock development
> - Clear phase-based organization
> - Minimal overhead for solo/small team development

---

## Overview

This project uses a **modified GitHub Flow** strategy that balances:
- ✅ Fast iteration and unblocked development
- ✅ Stability of main branch
- ✅ Clear organization by game phases
- ✅ Easy tracking of progress
- ✅ Straightforward for solo or small teams

```
main (always stable, deployable)
  ├── phase/3-client-rendering (dev work for Phase 3)
  ├── feature/grid-click-input (feature within a phase)
  ├── fix/navi-movement-bug (bugfix)
  └── experiment/custom-gauge (exploration, may be discarded)
```

---

## Branch Types

### 1. **Main Branch** (`main`)
- **Purpose:** Production-ready code
- **Status:** Always stable, all tests passing
- **Protection Rules:**
  - Require PR reviews (can be fast ~15 min)
  - Require status checks (TypeScript, tests)
  - No force pushes
  - Squash and merge commits (clean history)

**When to merge to main:**
- Feature complete (even if small)
- All tests passing
- TypeScript compiling cleanly
- Has been tested locally

---

### 2. **Phase Branches** (`phase/*`)
- **Purpose:** Main development branch for each phase
- **Naming:** `phase/N-phase-name` (e.g., `phase/3-client-rendering`)
- **Lifetime:** Duration of the phase (~1-3 days)
- **Branched from:** `main`
- **Merges back to:** `main` when phase complete

**Workflow for each phase:**
```
1. Create: git checkout -b phase/3-client-rendering main
2. Work on features within the phase
3. When phase complete: Merge PR back to main
4. Delete branch after merge
```

**Example phases:**
- `phase/1-project-setup` ✅ (completed, can delete)
- `phase/2-battle-core` ✅ (completed, can delete)
- `phase/3-client-rendering` 🔄 (current, active)
- `phase/4-server-infrastructure` 🔲 (not started)

---

### 3. **Feature Branches** (`feature/*`)
- **Purpose:** Individual features or subsystems within a phase
- **Naming:** `feature/[phase]-[feature-name]` (e.g., `feature/3-keyboard-input`)
- **Lifetime:** 1-3 days (should be merged frequently)
- **Branched from:** Phase branch (or main if working between phases)
- **Merges back to:** Phase branch or main

**When to create a feature branch:**
- Breaking down a phase into logical chunks
- Working on a specific feature (grid rendering, input handling, etc.)
- Need to experiment without blocking the phase branch

**Example feature branches:**
- `feature/3-grid-rendering`
- `feature/3-navi-input`
- `feature/3-battle-integration`

---

### 4. **Fix Branches** (`fix/*`)
- **Purpose:** Bug fixes
- **Naming:** `fix/[description]` (e.g., `fix/navi-movement-bounds`)
- **Lifetime:** Hours to 1 day
- **Branched from:** Phase branch (or main if urgent hotfix)
- **Merges back to:** Phase branch or main

**When to create a fix branch:**
- Found a bug in current phase
- Need to fix something critical
- Want to isolate the fix from other work

---

### 5. **Experiment Branches** (`experiment/*`)
- **Purpose:** Exploration, prototyping, testing ideas
- **Naming:** `experiment/[idea]` (e.g., `experiment/custom-gauge-animation`)
- **Lifetime:** Short-lived, exploratory only
- **Branched from:** main or phase branch
- **Merges back to:** main (if successful) or deleted (if unsuccessful)

**When to create an experiment branch:**
- Trying a new architecture or approach
- Exploring performance optimizations
- Testing a new library or pattern
- May be discarded without merging

**Note:** Use these freely! Experimentation is encouraged. Delete if not useful.

---

### 6. **Hotfix Branches** (`hotfix/*`)
- **Purpose:** Critical fixes to production/main
- **Naming:** `hotfix/[critical-issue]`
- **Lifetime:** Hours (urgent)
- **Branched from:** main (directly)
- **Merges back to:** main (immediately) + phase branches (later)

**When to create a hotfix branch:**
- Critical bug in deployed game
- Breaking TypeScript error in main
- Urgent security issue
- Test failures blocking all development

**Hotfix workflow:**
```bash
git checkout -b hotfix/critical-bug main
# Fix the issue
git commit -m "Fix: critical bug in grid renderer"
git push origin hotfix/critical-bug
# Create PR to main - expedite review
# Merge to main immediately
# Then cherry-pick to active phase branch if needed
```

---

## Naming Conventions

### Branch Naming Format
```
<type>/<phase>-<descriptive-name>
```

### Examples

✅ **Good:**
- `phase/3-client-rendering`
- `feature/3-grid-click-input`
- `fix/navi-movement-bounds`
- `experiment/custom-gauge-animation`
- `hotfix/typescript-error-rendering`

❌ **Bad:**
- `phase3` (unclear, missing phase name)
- `feature-grid` (no phase reference)
- `fix-bug` (vague)
- `dev` (ambiguous)
- `wip` (too informal)

---

## Commit Message Conventions

### Format
```
<type>(<scope>): <subject>

<body (optional)>
```

### Types
- **feat:** New feature (chip, rendering, etc.)
- **fix:** Bug fix
- **refactor:** Code restructuring without behavior change
- **test:** Add or update tests
- **docs:** Documentation changes
- **chore:** Build, CI, dependencies, tooling
- **perf:** Performance improvements

### Scope
Phase or system: `battle`, `rendering`, `network`, `campaign`, etc.

### Examples

✅ **Good:**
```
feat(rendering): Add grid click input handling

- Detect mouse clicks on grid panels
- Convert screen coordinates to grid positions
- Emit input action to battle engine
```

```
fix(battle): Fix panel ownership calculation
```

```
refactor(shared): Extract damage calculation to ChipSystem
```

```
test(battle): Add tests for element effectiveness

- Fire beats wood
- Aqua beats fire
- etc.
```

❌ **Bad:**
```
fix: bug fix
```

```
update stuff
```

```
wip
```

---

## Workflows

### Workflow 1: Complete a Phase Feature

```bash
# Start new phase work
git checkout main
git pull origin main
git checkout -b phase/3-client-rendering main

# Create feature branch for specific work
git checkout -b feature/3-grid-rendering phase/3-client-rendering

# Make changes, test, commit
echo "// grid code" > packages/client/src/rendering/GridRenderer.ts
npm run type-check && npm run test
git add .
git commit -m "feat(rendering): Implement grid renderer

- 6x3 grid with panel ownership visualization
- Blue for player1, red for player2, gray for neutral
- Updates in real-time as battle state changes"

# Push and create PR
git push origin feature/3-grid-rendering
# Create PR from feature/3-grid-rendering → phase/3-client-rendering

# After review, merge (can be just your own review if solo)
# Delete feature branch after merge

# Continue with next feature
git checkout phase/3-client-rendering
git pull
git checkout -b feature/3-navi-movement
# ... repeat
```

### Workflow 2: Fix a Bug During Development

```bash
# You're on feature/3-grid-rendering and find a bug
git checkout -b fix/grid-color-parsing

# Fix and test
npm run test
git commit -m "fix(rendering): Fix hex color parsing in GridRenderer"

# Merge back to the feature/phase branch
git push origin fix/grid-color-parsing
# Create PR to feature/3-grid-rendering
# Merge after review
```

### Workflow 3: Experiment with a New Approach

```bash
# Try something risky without blocking phase work
git checkout -b experiment/custom-gauge-performance main

# Try optimization idea
# If it works: merge to main
# If it doesn't: just delete the branch (no merge)

git push origin experiment/custom-gauge-performance

# Experiment leads nowhere?
git checkout main
git branch -D experiment/custom-gauge-performance
```

### Workflow 4: Critical Hotfix

```bash
# Urgent bug found in main
git checkout -b hotfix/typescript-compilation-error main

# Fix immediately
git commit -m "fix: restore missing import in BattleEngine"

# Push and create PR with "URGENT" or high priority
git push origin hotfix/typescript-compilation-error
# Create PR - request immediate review

# After merge to main, apply to active phase branch if needed
git checkout phase/3-client-rendering
git cherry-pick <commit-hash>
git push origin phase/3-client-rendering
```

---

## PR Review Process

### For Solo Development (You reviewing your own PRs)
1. Create branch and push
2. Create PR with detailed description
3. Run `npm run type-check && npm run test` locally
4. Self-review the changes on GitHub
5. Approve own PR
6. Merge with "Squash and merge"

### For Team Development (Multiple people)
1. Create branch and push
2. Create PR with description
3. Tag reviewers: `@teammate1 @teammate2`
4. Wait for approval (set expectation: ~15 min for quick reviews)
5. Resolve comments
6. Merge when approved

### PR Description Template

```markdown
## Description
Brief summary of what this does

## Changes
- Change 1
- Change 2
- Change 3

## Testing
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Tests pass: `npm run test`
- [ ] Visual check (if applicable): tested locally

## Related Issues
Fixes #123 (if applicable)
```

---

## Branch Protection Rules for Main

Recommended GitHub/GitLab settings for `main` branch:

```
Require pull request reviews: Yes
Dismiss stale reviews: Yes
Require approval count: 1 (solo) or 2 (team)
Require status checks: Yes
  - TypeScript compilation
  - Tests passing
  - Linting
Restrict who can push: Admins only
Require branches to be up-to-date: Yes
Allow force pushes: No
Allow deletions: No
Require linear history: Optional (recommended: Yes)
```

---

## Phase-Based Organization

### Phase 1-2 (Completed)
```
✅ main (contains all completed work)
```

### Phase 3 (Current)
```
main
└── phase/3-client-rendering
    ├── feature/3-grid-rendering ✅ (merged)
    ├── feature/3-navi-movement 🔄 (in progress)
    ├── feature/3-chip-effects 🔲 (queued)
    └── fix/input-bounds 🔲 (if needed)
```

### Phase 4+ (Future)
```
main (will hold all previous phases)
├── phase/4-server-infrastructure
├── phase/5-client-server-integration
└── ... etc
```

---

## Common Git Commands

### Create a feature branch
```bash
git checkout -b feature/3-keyboard-input main
```

### Work and commit
```bash
git status
git add .
git commit -m "feat(input): Add keyboard input handling for movement"
```

### Push and create PR
```bash
git push origin feature/3-keyboard-input
# Then create PR on GitHub/GitLab
```

### Merge PR locally (if needed)
```bash
git checkout main
git pull origin main
git merge --squash feature/3-keyboard-input
git commit -m "feat(input): Add keyboard input handling for movement"
git push origin main
```

### Delete local branch
```bash
git branch -d feature/3-keyboard-input
```

### Delete remote branch
```bash
git push origin --delete feature/3-keyboard-input
```

### View all branches
```bash
git branch -a
```

### Switch between branches
```bash
git checkout phase/3-client-rendering
git checkout feature/3-grid-rendering
```

---

## Best Practices

### ✅ Do
- ✅ Create branches for all work (never commit directly to main)
- ✅ Keep branches focused on single feature/fix
- ✅ Merge frequently (at least daily)
- ✅ Delete branches after merge
- ✅ Write descriptive commit messages
- ✅ Test before pushing
- ✅ Use type-safe imports: `import { ... } from '@mmbn/shared'`
- ✅ Review your own code before committing

### ❌ Don't
- ❌ Force push to main
- ❌ Commit directly to main
- ❌ Long-lived branches (>3 days)
- ❌ Mix multiple features in one branch
- ❌ Push broken code (check `npm run type-check` first)
- ❌ Large commits without clear message
- ❌ Delete main branch
- ❌ Rebase main (use squash merge instead)

---

## Typical Week of Development

### Monday
```
✅ Phase 1-2: Complete (merged to main)
🔄 Phase 3: Start
   ├─ phase/3-client-rendering created
   ├─ feature/3-grid-rendering in progress
```

### Tuesday
```
✅ feature/3-grid-rendering merged to phase/3-client-rendering
🔄 feature/3-navi-movement in progress
   (feature/3-grid-rendering branch deleted)
```

### Wednesday
```
✅ feature/3-navi-movement merged
🔄 feature/3-battle-integration in progress
✅ Phase 3 nearing completion
```

### Thursday
```
✅ Phase 3: Complete
   ├─ phase/3-client-rendering merged to main
   ├─ All feature branches deleted
   ├─ main branch now contains Phases 1-3
🔄 Phase 4: Start
   └─ phase/4-server-infrastructure created
```

### Friday
```
🔄 Phase 4 development
   ├─ feature/4-socket-setup in progress
   └─ experiment/custom-protocol-testing (exploration)
```

---

## Troubleshooting

### "I committed to the wrong branch"
```bash
git reset --soft HEAD~1  # Undo commit, keep changes
git stash  # Save changes temporarily
git checkout correct-branch
git stash pop  # Restore changes
git commit -m "correct message"
```

### "I need to sync with main"
```bash
git fetch origin
git merge origin/main  # or git rebase origin/main if linear history required
git push origin feature/my-feature
```

### "I want to start over on this branch"
```bash
git reset --hard origin/main  # Reset to main state
# Or delete and recreate
git checkout main
git branch -D feature/broken
git checkout -b feature/my-feature main
```

### "What changed on main since I branched?"
```bash
git diff main..HEAD  # Show changes in current branch
git log main..HEAD  # Show commits in current branch
```

---

## Integration with CI/CD

When implemented, CI/CD will:
1. Run on all PRs automatically
2. Check TypeScript compilation
3. Run all tests
4. Check code linting
5. Block merge if any check fails

This ensures main is always stable and deployable.

---

## Summary

| Aspect | Strategy |
|--------|----------|
| **Main approach** | Modified GitHub Flow |
| **Branch lifetime** | 1-3 days max |
| **Commit style** | Conventional commits |
| **Merge strategy** | Squash and merge to main |
| **Iteration speed** | Daily or multiple times daily |
| **Team scalability** | Good for 1-10 developers |
| **Release process** | Tag main when ready to deploy |
| **Hotfix handling** | Direct branch from main, urgent merge |

---

**Last Updated:** 2026-02-17
