# Git Branching Strategy

> **Strategy:** Modified GitHub Flow optimized for rapid game development iteration
>
> **Principles:**
> - Main branch is always deployable — only receives sprint merge commits
> - Sprint branches (`sprint/N`) are the WIP integration layer — all daily work lands here
> - Short-lived feature branches (1-3 days max) branch off the sprint branch
> - Clear milestone-based planning (milestones are PLAN.md concepts, not git branches)
> - Minimal overhead for solo/small team development

---

## Overview

This project uses a **modified GitHub Flow** strategy that balances:
- ✅ Fast iteration and unblocked development
- ✅ Stability of main branch — only sprint merge commits land here
- ✅ Milestone-oriented planning with sprint integration branches
- ✅ Easy tracking of progress — each sprint tag maps to a merge commit
- ✅ Straightforward for solo or small teams

```
main (always stable — one merge commit per sprint)
  └── sprint/7 (active sprint integration branch)
        ├── feature/game-start-menu (feature work)
        ├── feature/hold-to-move (feature work)
        ├── fix/navi-bounds (bug fix)
        └── chore(kanban): update idea cards (PM commits land here directly)
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
- The sprint's batch of work is done (your call — no formal sprint AC list)
- Any milestone ACs satisfied this sprint are checked off in PLAN.md
- All tests passing, TypeScript compiling cleanly
- Ceremony-closing has run and the sprint changelog entry is written
- Tag `v0.N.0` is applied to the merge commit

---

### 2. **Sprint Branches** (`sprint/*`)
- **Purpose:** Integration branch for one sprint — all daily work accumulates here
- **Naming:** `sprint/N` (e.g., `sprint/7`)
- **Lifetime:** Duration of the sprint (typically 1–7 days)
- **Branched from:** `main`
- **Merges back to:** `main` at sprint end (regular merge, not squash — preserve history)

**What goes directly on the sprint branch (no sub-branch needed):**
- PM commits (`chore(kanban):`, `chore(docs):`, `docs:`)
- Small fixes (< 30 min, low risk)
- Ceremony-closing changes (changelog, PLAN.md, progress.md)

**What gets its own `feature/*` sub-branch:**
- Any new game feature
- Refactors touching multiple files
- Risky or experimental work

**Sprint lifecycle:**
```bash
# 1. Start sprint
git checkout main && git pull origin main
git checkout -b sprint/7

# 2. Work (commit PM/docs directly, branch for features)
git commit -m "chore(kanban): update idea cards"
git checkout -b feature/game-start-menu  # branch for real features
# ... merge feature back to sprint/7

# 3. Close sprint — decide the batch of work is done, then:
# Run /work:ceremony-closing (updates changelog, checks off any milestone ACs satisfied)
git checkout main
git merge sprint/7 --no-ff -m "chore(sprint): close Sprint 7 — [theme]"
git tag -a v0.7.0 -m "Sprint 7: [theme]"
git push origin main --tags
git branch -d sprint/7
git push origin --delete sprint/7
```

---

### 3. **Milestones (Planning Concept — not git branches)**

Milestones are defined in `kanban/PLAN.md` and represent major deliverables
(e.g., "First Playable", "PVP Multiplayer"). They span multiple sprints —
too long for a practical git branch.

**Milestones are NOT branches.** Work toward a milestone flows through
`sprint/*` integration branches (and `feature/*` sub-branches within them),
all of which eventually merge to `main` at sprint close.
A milestone is "complete" when all its ACs in PLAN.md are checked off,
at which point a `## 🏁 Milestone` entry is added to CHANGELOG.md.

---

### 3. **Feature Branches** (`feature/*`)
- **Purpose:** Individual features or subsystems toward a milestone
- **Naming:** `feature/[descriptive-name]` (e.g., `feature/keyboard-input`)
- **Lifetime:** 1-3 days (should be merged frequently)
- **Branched from:** `sprint/N`
- **Merges back to:** `sprint/N`

**When to create a feature branch:**
- Implementing a distinct feature toward the current milestone
- Working on a specific feature (grid rendering, input handling, etc.)
- Need to isolate risky or multi-file changes from the sprint branch

**When to skip a feature branch (commit directly to sprint/N):**
- PM commits (`chore(kanban):`, `docs:`, small config tweaks)
- Quick fixes under 30 minutes that are obviously safe

**Example feature branches:**
- `feature/grid-rendering`
- `feature/navi-input`
- `feature/battle-integration`

---

### 4. **Fix Branches** (`fix/*`)
- **Purpose:** Bug fixes
- **Naming:** `fix/[description]` (e.g., `fix/navi-movement-bounds`)
- **Lifetime:** Hours to 1 day
- **Branched from:** `sprint/N`
- **Merges back to:** `sprint/N`

**When to create a fix branch:**
- Found a bug during current milestone work
- Need to fix something critical
- Want to isolate the fix from other work

---

### 5. **Experiment Branches** (`experiment/*`)
- **Purpose:** Exploration, prototyping, testing ideas
- **Naming:** `experiment/[idea]` (e.g., `experiment/custom-gauge-animation`)
- **Lifetime:** Short-lived, exploratory only
- **Branched from:** `sprint/N`
- **Merges back to:** `sprint/N` (if successful) or deleted (if unsuccessful)

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
- **Merges back to:** `main` (immediately)

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
```

---

## Naming Conventions

### Branch Naming Format
```
<type>/<descriptive-name>
```

Sprint branches use a number only:
```
sprint/<N>
```

### Examples

✅ **Good:**
- `sprint/7`
- `feature/grid-click-input`
- `fix/navi-movement-bounds`
- `experiment/custom-gauge-animation`
- `hotfix/typescript-error-rendering`

❌ **Bad:**
- `feature-grid` (missing type prefix)
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

### Workflow 1: Complete a Feature Toward a Milestone

```bash
# Branch off the active sprint branch (not main)
git checkout sprint/7
git checkout -b feature/grid-rendering

# Make changes, test, commit
npm run type-check && npm run test
git add packages/client/src/rendering/GridRenderer.ts
git commit -m "feat(rendering): Implement grid renderer

- 6x3 grid with panel ownership visualization
- Blue for player1, red for player2, gray for neutral
- Updates in real-time as battle state changes"

# Merge back to sprint branch (not main)
git checkout sprint/7
git merge --squash feature/grid-rendering
git commit -m "feat(rendering): Implement grid renderer"
git branch -d feature/grid-rendering

# Continue with next feature — still on sprint/7
git checkout -b feature/navi-movement
# ... repeat until sprint is done
```

### Workflow 2: Fix a Bug During Development

```bash
# Branch off the active sprint branch
git checkout sprint/7
git checkout -b fix/grid-color-parsing

# Fix and test
npm run test
git commit -m "fix(rendering): Fix hex color parsing in GridRenderer"

# Merge back to sprint branch
git checkout sprint/7
git merge --squash fix/grid-color-parsing
git commit -m "fix(rendering): Fix hex color parsing in GridRenderer"
git branch -d fix/grid-color-parsing
```

### Workflow 3: Experiment with a New Approach

```bash
# Branch off sprint branch — safe to discard without affecting sprint
git checkout -b experiment/custom-gauge-performance sprint/7

# Try optimization idea
# If it works: merge back to sprint/7
# If it doesn't: just delete the branch (no merge)

git push origin experiment/custom-gauge-performance

# Experiment leads nowhere?
git checkout sprint/7
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
# Create PR to main - request immediate review
# Merge to main immediately
# Then cherry-pick to active sprint branch to stay in sync:
git checkout sprint/7
git cherry-pick <commit-hash>
```

### Workflow 5: Sprint Lifecycle (Start → Work → Close)

```bash
# ── START OF SPRINT ──────────────────────────────────────────
git checkout main && git pull origin main
git checkout -b sprint/7

# ── DURING SPRINT ────────────────────────────────────────────
# PM / docs commits go directly on sprint branch:
git commit -m "chore(kanban): update idea cards"

# Feature work gets its own branch off sprint:
git checkout -b feature/game-start-menu
# ... implement, then merge back:
git checkout sprint/7
git merge --squash feature/game-start-menu
git commit -m "feat(ui): add game start menu"
git branch -d feature/game-start-menu

# ── CLOSE SPRINT ─────────────────────────────────────────────
# 1. Run ceremony-closing (/work:ceremony-closing) — updates changelog,
#    checks off any milestone ACs satisfied, commits docs to sprint/7

# 2. Merge sprint branch to main (--no-ff preserves sprint history)
git checkout main
git merge sprint/7 --no-ff -m "chore(sprint): close Sprint 7 — Game Start Menu & Input Polish"

# 3. Tag the merge commit
git tag -a v0.7.0 -m "Sprint 7: Game Start Menu & Input Polish"

# 4. Push everything
git push origin main --tags

# 5. Clean up sprint branch
git branch -d sprint/7
git push origin --delete sprint/7
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

## Code Review Process

Before committing or pushing, perform a **three-tier code review** based on the scope of changes:

### Tier 1: Automated Checks (Always Required)
Run these before every commit:

```bash
npm run type-check    # TypeScript compilation - no errors
npm run test          # All tests passing
npm run lint          # ESLint checks
npm run build         # Production build succeeds
```

**Time:** ~30 seconds
**Must pass:** Yes, always
**Blocks commit:** Yes

**Checklist:**
- ✅ No TypeScript errors
- ✅ All tests passing (especially `npm run test:shared` for battle logic)
- ✅ No linting warnings
- ✅ Production build works

---

### Tier 2: Architecture Checkpoints (For All Changes)
After automated checks pass, manually verify:

**Import & Module Integrity:**
- ✅ Cross-package imports use `@mmbn/shared` (not relative paths)
- ✅ No circular dependencies
- ✅ Client doesn't import from server or vice versa

**Type Safety:**
- ✅ No `any` types used (unless absolutely necessary with comment)
- ✅ Proper TypeScript interfaces/types defined
- ✅ Imports properly typed from shared

**Shared Logic Purity:**
- ✅ Battle engine functions are deterministic (same input = same output)
- ✅ No side effects in shared logic
- ✅ No browser APIs in shared code
- ✅ No server-only code in shared

**Pattern Consistency:**
- ✅ Code style matches existing implementations
- ✅ Naming conventions followed
- ✅ Error handling at system boundaries only

**Breaking Changes:**
- ✅ Changes don't break other packages' tests
- ✅ Public APIs documented
- ✅ Backward compatible (or intentional breaking change noted)

**Time:** ~5 minutes
**Must pass:** Yes, for all commits
**Blocks commit:** Yes

---

### Tier 3: Design Review (For Major Architectural Changes)

**Use this for:**
- Major features affecting battle system
- New systems (camera, input, effects)
- Significant refactoring
- Anything that would "vastly change the architecture"
- Features spanning multiple milestones

**Before implementation, ask:**

1. **Does this fit our architecture?**
   - Will it work with deterministic battle engine?
   - Compatible with client-server model?
   - Won't create tight coupling?

2. **Is this the simplest approach?**
   - Could we achieve the same with less code?
   - Are we over-engineering?
   - Does it follow existing patterns?

3. **Will it scale to production?**
   - Performance impact (60 FPS target)?
   - Memory impact (server handling 100+ battles)?
   - Network bandwidth implications?

4. **What are the edge cases?**
   - What if grid size changes?
   - What if chip effects overlap?
   - What if network latency spikes?
   - What if user disconnects?

5. **How does it integrate with existing code?**
   - Any refactoring needed?
   - Test coverage required?
   - Documentation needed?

**Time:** ~15-30 minutes (before coding)
**Must pass:** Yes, for major changes
**How to execute:** Think through, discuss with yourself, document assumptions

**Examples of when to do Tier 3:**
- ✅ Adding input handling to the battle system
- ✅ Designing server battle simulation
- ✅ Implementing client-server state sync
- ❌ Adding a new chip to the data file (skip, it's data)
- ❌ Tweaking UI colors (skip, cosmetic)

---

## Review Workflow Summary

```
┌─ Every Commit ─────────────────────────────────────┐
│ 1. Make changes                                    │
│ 2. Run Tier 1: Automated checks (30 sec)          │
│    → If fails: Fix and retry                       │
│    → If passes: Continue                           │
│ 3. Do Tier 2: Architecture checkpoints (5 min)    │
│    → If fails: Fix and retry                       │
│    → If passes: Continue                           │
│ 4. Commit with conventional message                │
└────────────────────────────────────────────────────┘

┌─ Major Changes Only ───────────────────────────────┐
│ Before Implementation (save hours of rework):      │
│ 1. Do Tier 3: Design review (15-30 min)          │
│ 2. Document assumptions                           │
│ 3. Then proceed with implementation                │
│ 4. Then do Tiers 1 & 2 before committing          │
└────────────────────────────────────────────────────┘
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

## Milestone-Based Organization

Milestones are defined in `kanban/PLAN.md`. Work flows through `sprint/*` integration branches,
with `feature/*` sub-branches within each sprint. Only sprint merge commits land on `main`.

### First Playable (In Progress — Sprint 1–N)
Each sprint delivers a batch of work toward the milestone.
Milestone complete when all ACs in PLAN.md are checked.
A `## 🏁 Milestone` changelog entry is written at that point.

### Campaign Mode, PVP Multiplayer, Content Expansion, Polish & UX, Competitive Features (Future)
Each will be delivered across multiple sprints in the same pattern.

---

## Common Git Commands

### Start a new sprint
```bash
git checkout main && git pull origin main
git checkout -b sprint/7
git push origin sprint/7
```

### Create a feature branch (off sprint)
```bash
git checkout -b feature/keyboard-input sprint/7
```

### Work and commit
```bash
git status
git add packages/client/src/input/InputHandler.ts
git commit -m "feat(input): Add keyboard input handling for movement"
```

### Merge feature back to sprint (squash)
```bash
git checkout sprint/7
git merge --squash feature/keyboard-input
git commit -m "feat(input): Add keyboard input handling for movement"
git branch -d feature/keyboard-input
```

### Close sprint — merge to main and tag
```bash
git checkout main
git merge sprint/7 --no-ff -m "chore(sprint): close Sprint 7 — [theme]"
git tag -a v0.7.0 -m "Sprint 7: [theme]"
git push origin main --tags
git branch -d sprint/7
git push origin --delete sprint/7
```

### View all branches
```bash
git branch -a
```

### Switch between branches
```bash
git checkout sprint/7
git checkout feature/grid-rendering
```

---

## Best Practices

### ✅ Do
- ✅ All daily work goes to `sprint/N` — never commit directly to main
- ✅ Keep `feature/*` branches focused on a single feature/fix
- ✅ Merge feature branches back to sprint branch frequently (at least daily)
- ✅ Delete feature/fix branches after merging to sprint
- ✅ Write descriptive commit messages
- ✅ Test before pushing
- ✅ Use type-safe imports: `import { ... } from '@mmbn/shared'`
- ✅ Review your own code before committing

### ❌ Don't
- ❌ Force push to main
- ❌ Commit directly to main
- ❌ Long-lived `feature/*` or `fix/*` branches (>3 days) — merge to sprint and move on
- ❌ Mix multiple features in one `feature/*` branch
- ❌ Push broken code (check `npm run type-check` first)
- ❌ Large commits without clear message
- ❌ Delete main branch
- ❌ Rebase main (use squash merge instead)

**Note on sprint branch lifetime:** `sprint/*` branches are the exception to the "no long-lived branches" rule. A sprint can span 1–7 days by design. The constraint is on `feature/*` branches within the sprint, not on the sprint branch itself.

---

## Typical Week of Development

Milestones are the north star. Sprints are the weekly cadence. `main` only moves at sprint close.

### Monday
```
Milestone: First Playable (in progress)

git checkout -b sprint/7 main   ← sprint branch created

🔄 feature/chip-damage-engine branched from sprint/7
   ├─ ChipSystem.ts updated — chips deal damage
   └─ BattleEngine tests updated
```

### Tuesday
```
✅ feature/chip-damage-engine merged to sprint/7 (deleted)
🔄 feature/simple-ai-wiring branched from sprint/7
   └─ SimpleAI.ts + BattleScene integration
chore(kanban): add idea cards   ← PM commit directly on sprint/7
```

### Wednesday
```
✅ feature/simple-ai-wiring merged to sprint/7 (deleted)
🔄 feature/hud-react-overlay branched from sprint/7
   ├─ React HUD components
   └─ Zustand store integration
```

### Thursday
```
✅ feature/hud-react-overlay merged to sprint/7 (deleted)
🔄 /work:ceremony-closing runs on sprint/7
   ├─ Changelog entry written, milestone ACs checked off
   └─ All docs updated

git checkout main
git merge sprint/7 --no-ff     ← sprint closes, main moves
git tag -a v0.7.0              ← tagged
git push origin main --tags
git branch -d sprint/7
```

### Friday
```
git checkout -b sprint/8 main  ← next sprint starts immediately
🔄 feature/win-lose-condition branched from sprint/8
└─ experiment/battle-replay branched from sprint/8 (exploration)
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

## Tagging & Versioning Strategy

### Version Format

```
v0.<sprint>.<patch>
```

- **Major (`0`):** Stays at `0` until first public release (v1.0.0)
- **Minor:** Maps to the completed sprint number
- **Patch:** Increments for hotfixes or follow-up fixes within a sprint

### When to Tag

Tag `main` immediately after merging the sprint branch:
1. `sprint/N` merged to `main` with `--no-ff`
2. Ceremony-closing has run — changelog updated, milestone ACs checked
3. All tests passing, TypeScript compiling

### How to Tag

```bash
# Immediately after: git merge sprint/N --no-ff
git tag -a v0.<N>.0 -m "Sprint <N>: <short description>"
git push origin main --tags
```

Tag the merge commit — not a feature commit or docs commit mid-sprint.

### Patch Tags

For hotfixes or follow-up fixes after a sprint tag:

```bash
# e.g., fixing a bug discovered after Sprint 7 was tagged
git tag -a v0.7.1 -m "Sprint 7: Fix [description]"
git push origin v0.7.1
```

### v1.0.0 Milestone

The project graduates to `v1.0.0` when:
- First Playable milestone complete
- PVP Multiplayer milestone complete
- Campaign Mode milestone complete
- Polish & UX milestone complete

After v1.0.0, follow standard [semver](https://semver.org/):
- **Major:** Breaking changes to network protocol or save format
- **Minor:** New features (chips, modes, mechanics)
- **Patch:** Bug fixes

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
| **Release process** | Tag main per sprint/milestone (see Tagging Strategy) |
| **Hotfix handling** | Direct branch from main, urgent merge |

---

**Last Updated:** 2026-02-19
