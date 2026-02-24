---
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, AskUserQuestion
---

# /work:ceremony-closing

You are the closing ceremony orchestrator for a coding session. Your job is to verify the
codebase is healthy, analyze code quality, update all living documents, and commit/push
cleanly — all from this single command.

**Do not rush or skip steps.** Each step has a gate. Fail fast and loud if something is wrong.

---

## PREAMBLE — Detect Branch Type

```bash
git branch --show-current
```

Classify the current branch and carry this classification through every subsequent step:

| Branch pattern | Classification | Closing action |
|---|---|---|
| `sprint/N` | **Sprint close** | Commit docs → merge to main → tag v0.N.0 → push → delete branch |
| `feature/*`, `fix/*`, `experiment/*` | **Session save** | Commit to current branch → push → remind user to merge to sprint when done |
| `main` | **Unusual** | Warn user: "You're on main directly. All work should go through a sprint branch. Proceed anyway? (y/n)" |

Report which mode was detected before proceeding:
```
Branch: sprint/7
Mode: SPRINT CLOSE — will merge to main and tag v0.7.0 after docs are updated
```

---

## STEP 1 — Full Verification Suite

Run all checks **sequentially**. If any fail, print the failure output, tell the user what to
fix, and **STOP**. Do not proceed to Step 2 until every check is green.

### 1a. TypeScript compilation

```bash
npm run type-check
```

- Zero errors required. Warnings are allowed.
- If errors: print them and stop.

### 1b. ESLint

```bash
npm run lint
```

- Zero errors required. Warnings are allowed.
- If errors: print them and stop.

### 1c. Test suite

```bash
npm run test > /tmp/mmbn-ceremony-tests.log 2>&1
```

- Zero failures required.
- Write output to a temp file, then spawn an `analyze-file` agent to summarize it.
  Only the compact summary comes back to the main window.

**analyze-file prompt:**
```
Read the test output file at /tmp/mmbn-ceremony-tests.log.
Extract: total tests run, total passed, total failed, any failure details (test name + error message).
Format as: "Tests: N passed / N failed" followed by a bullet list of any failures.
Keep it under 10 lines.
```

**If analyze-file reports any failures:**
- Spawn a `test-runner` agent for deep diagnosis. Prompt:
  ```
  Run the full test suite for the mmbn-web project at /Users/howardtjong/Vibes/mmbn-web.
  Use `npm run test` to execute. Analyze all failures: root causes, stack traces, and
  suggested fixes. Prioritize by severity (Critical/High/Medium/Low).
  ```
- Print the test-runner's full analysis output.
- **STOP.** Tell the user: "Tests are failing. Fix the issues above, then re-run `/work:ceremony-closing`."

### 1d. Dev server health check

```bash
npm run dev > /tmp/mmbn-ceremony-dev.log 2>&1 &
DEV_PID=$!
sleep 12
cat /tmp/mmbn-ceremony-dev.log
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
rm -f /tmp/mmbn-ceremony-dev.log
```

- Look for evidence of a clean start: `Local:`, `ready`, port bindings, or similar Vite/Node
  startup messages.
- Look for errors: `Error`, `EADDRINUSE`, `Cannot find module`, `SyntaxError`, etc.
- If port 5173 or 3000 is already in use (`EADDRINUSE`), stop and tell the user to kill the
  existing process first, then re-run `/work:ceremony-closing`.
- If clean: report ✅ dev server

### 1e. Storybook health check

```bash
npm run storybook --workspace=packages/client > /tmp/mmbn-ceremony-storybook.log 2>&1 &
SB_PID=$!
sleep 20
cat /tmp/mmbn-ceremony-storybook.log
kill $SB_PID 2>/dev/null
wait $SB_PID 2>/dev/null
rm -f /tmp/mmbn-ceremony-storybook.log
```

- Look for: `Storybook started`, `http://localhost:6006`, or similar success messages.
- Look for: build errors, missing story files, TypeScript errors in stories.
- If port 6006 is already in use, stop and tell the user to kill the existing process first.
- If clean: report ✅ storybook

### Step 1 Report

Print a one-line status for each check before proceeding:

```
✅ type-check — clean
✅ lint — clean (N warnings)
✅ tests — 33/33 passed
✅ dev server — started on ports 5173 + 3000
✅ storybook — started on port 6006
```

If Storybook does not exist yet in the project (no `.storybook/` directory, no storybook script
in `packages/client/package.json`), skip the Storybook check and note it as skipped.

---

## STEP 2 — Audit: What Changed?

```bash
git status
git diff HEAD
git log --oneline -10
```

- Collect the full list of modified files (tracked unstaged + staged).
- For a **sprint close**: also collect the full list of commits on this sprint branch since it
  diverged from main — `git log main..HEAD --oneline` — to capture the complete sprint scope,
  not just today's changes.
- If the working tree is completely clean (no changes), report this clearly and ask:
  "Working tree is clean — nothing to commit. Did you mean to run this? (y to continue, n to stop)"
  If the user says no, exit gracefully.
- Save the list of changed files for Steps 4 and 8.

### 2a — Code Change Detection

Run this to get the full list of files changed since the branch diverged from its parent:

```bash
# For sprint branches:
git diff main...HEAD --name-only

# For feature/fix/experiment branches (substitute the detected sprint branch):
git diff sprint/N...HEAD --name-only
```

From the output, check whether any **code files** changed. Code files are:
- Anything under `packages/`
- Anything under `scripts/`
- Anything under `.github/`
- Root `package.json` or `package-lock.json`
- Root config files: `tsconfig*.json`, `vite.config.*`, `*.config.[jt]s`, `.eslintrc.*`

Set a flag carried into Step 4:
- **CODE_CHANGED = true** — at least one code file appears in the diff
- **CODE_CHANGED = false** — only docs, kanban cards, `.claude/` files, or other non-code files changed

Report the flag inline:
```
Code changes detected: YES  (packages/shared/src/battle/BattleEngine.ts, ...)
```
or
```
Code changes detected: NO  (only docs/kanban/.claude files changed)
```

---

## STEP 3 — Context Load: What Is the Current Milestone About?

Read these files silently (do not dump their full contents to the user):

- `kanban/PLAN.md` — identify the **current milestone** name, goal, and its acceptance criteria
  (there are no sprint ACs — only milestone ACs; a sprint is an informal batch of work)
- `kanban/CHANGELOG.md` — read the most recent sprint header to determine the next sprint number
- `.claude/context/progress.md` — current project status snapshot
- List files in `kanban/ongoing/` — these describe the active work cards

After reading, produce a concise internal summary:
- Current milestone name and goal
- Which milestone AC items are already checked off vs still open
- What the ongoing cards describe
- What this session appears to have completed (based on changed files + card descriptions)

Output to the user (1-3 sentences):
> "This session completed: [X], [Y], [Z], contributing to the [Milestone Name] milestone."

---

## STEP 4 — Code Analysis: Quality Gate

**If CODE_CHANGED is false** (set in Step 2a):
- Skip the `analyze-code` agent entirely.
- Report: `⏭️ code analysis — skipped (no changes to packages/, scripts/, .github/, or root config files)`
- Continue directly to Step 5.

**If CODE_CHANGED is true**, proceed with the full analysis below.

Spawn an `analyze-code` agent. Provide it the following prompt **inline** (subagents have no
access to conversation history, so all context must be in the prompt):

---

**analyze-code prompt template:**

```
You are reviewing code changes in an MMBN3-inspired web game monorepo.

CHANGED FILES (from git diff HEAD):
[paste the list of modified files from Step 2]

FULL DIFF (paste the git diff HEAD output here, truncated to first 300 lines if very large):
[paste diff]

ARCHITECTURAL RULES TO CHECK AGAINST:
1. Determinism — BattleEngine and shared/ logic must be pure functions (no Math.random,
   Date.now, side effects). If randomness is needed, it must come via seeded input.
2. ESM imports — packages/shared/ relative imports MUST use .js extensions. packages/client/
   and packages/server/ do NOT need .js extensions.
3. Dumb components — React UI components must not call useBattleStore() directly unless they
   are an Organism. Atoms and Molecules receive all data via props.
4. Stale closure pattern — useEffect handlers that fire store actions must read fresh state
   via useBattleStore.getState(), not capture reactive values in closures.
5. Monorepo imports — cross-package imports must use @mmbn/shared, never relative ../../.
6. State purity — BattleState must remain JSON-serializable (plain objects, no class instances).
7. Test discipline — shared/ changes require corresponding test coverage.
8. TypeScript — no `any` types without a justified comment; no `as` casts to silence errors.

GOAL: Find bugs, verify alignment with the architectural rules above, flag any critical issues.
Use the analyze-code output format (BUG HUNT SUMMARY).
```

---

Receive the compact BUG HUNT SUMMARY back.

**Gate:** If the summary reports any **CRITICAL FINDINGS**:
- Print the blockers clearly
- **STOP**
- Tell the user: "Critical issues found. Fix these before closing the session, then re-run
  `/work:ceremony-closing`."

If POTENTIAL ISSUES only (no criticals): present them to the user as a heads-up but continue.

---

## STEP 5 — Change Summary

Using the git diff from Step 2 and the milestone context from Step 3, produce concise
purpose-oriented bullet points of what changed and *why*:

- Focus on intent ("Added X so that Y can happen"), not file names
- 3-8 bullets
- For a **sprint close**, draw from the full sprint commit range (`git log main..HEAD`), not
  just the most recent unstaged changes
- This becomes the basis for the changelog entry and commit message

Example output:
```
Changes this session:
- Implemented chip-select overlay UI (Atoms + Molecules + BattleHud organism)
- Wired useBattleHud hook to bridge Zustand store and React UI
- Added Storybook stories for all new presentational components
- Fixed stale closure bug in custom gauge keyboard handler
```

---

## STEP 6 — Draft Changelog Entry

Run `date "+%Y-%m-%d %H:%M %Z"` to get the current time.
Read `kanban/CHANGELOG.md`.

The behavior here differs by branch type:

---

### 6A — Sprint close (`sprint/N`)

Extract N from the current branch name (`sprint/N`). Then check `kanban/CHANGELOG.md`:

**Case 1 — A blank placeholder entry for Sprint N already exists** (created by
`/work:ceremony-opening`). It looks like:

```markdown
## Sprint N: [TBD]
**Date:** TBD

_(Sprint opened — title, date, and bullets will be filled in by `/work:ceremony-closing`.)_
```

Draft an **updated** version of that entry — same position in the file, replacing the
placeholder in place:

```markdown
## Sprint N: [Title]
**Date:** YYYY-MM-DD HH:MM PST

- [bullet from Step 5]
- [bullet from Step 5]

**Key decisions:**
- [any architectural or design choices made this session, or omit this section if none]
```

**Case 2 — No entry for Sprint N exists yet.** Draft a brand new sprint entry to be
inserted at the top of the file (after the intro block, before the previous sprint entry):

```markdown
## Sprint N: [Title]
**Date:** YYYY-MM-DD HH:MM PST

- [bullet from Step 5]
- [bullet from Step 5]

**Key decisions:**
- [any architectural or design choices made this session, or omit this section if none]
```

Rules (apply in both cases):
- Title: 2-5 words capturing the sprint's overall theme
- Date: run `date "+%Y-%m-%d %H:%M %Z"` and use the result — always a real timestamp, never TBD
- Bullets: purpose-oriented, not file-name-oriented
- Note which milestone ACs were satisfied across this sprint (by name)

**If a milestone completion was detected in Step 7b:** Also draft a `## 🏁 Milestone` entry.
Present both to the user — milestone first, sprint second. Both approved before Step 7a writes.

```markdown
## 🏁 Milestone: [Name]
**Reached:** YYYY-MM-DD HH:MM PST
**Sprints:** Sprint N – Sprint M

[2-3 sentences, player/product-impact focused, not implementation-focused.]
```

`Sprint N` = earliest sprint that contributed (read CHANGELOG.md). `Sprint M` = current sprint.

Present all draft(s) to the user for review before writing anything.

---

### 6B — Feature/fix/experiment close (`feature/*`, `fix/*`, `experiment/*`)

Determine the parent sprint number from the parent branch name (e.g. `sprint/7` → Sprint 7).

Search `kanban/CHANGELOG.md` for an existing `## Sprint 7:` entry.

**Case 1 — Entry does NOT exist yet:**

Ask the user:
> "No changelog entry found for Sprint 7 yet. Should I create one now with the work from
> this branch? (y/n)"

If yes, draft a new entry:
```markdown
## Sprint 7: [Title reflecting this branch's work]
**Date:** YYYY-MM-DD HH:MM PST

- [bullet from Step 5 describing this branch's contribution]
- [bullet from Step 5]
```

**Case 2 — Entry ALREADY exists:**

Append the session's bullets from Step 5 to the existing entry's bullet list. Do not duplicate
bullets already present. Draft the appended version for user review before writing:

```markdown
## Sprint 7: [Existing Title]           ← keep as-is
**Date:** YYYY-MM-DD HH:MM PST          ← keep as-is

- [existing bullet 1]                   ← keep as-is
- [existing bullet 2]                   ← keep as-is
- [NEW bullet from this branch]         ← append
- [NEW bullet from this branch]         ← append
```

Present the draft (new or appended) to the user for review before writing anything.

---

## STEP 7 — Document Updates

Once the user approves the changelog draft, write all document updates:

### 7a. Update `kanban/CHANGELOG.md`

**Sprint close — Case 1 (blank placeholder exists):** Find the existing `## Sprint N: [TBD]`
block and replace it in place with the approved entry. Do not insert a new entry at the top.
If a milestone entry was approved, insert it immediately above the (now-updated) sprint entry,
separated by `---`.

**Sprint close — Case 2 (no existing entry):** Insert the new sprint entry at the top of the
file (after the `# Changelog` header and intro block, before the previous latest sprint entry).
If a milestone entry was approved, insert it above the sprint entry, separated by `---`.

**Feature/fix/experiment close:** Either prepend the new Sprint N entry to the top of the file
(if it didn't exist), or find the existing `## Sprint N:` block and append the new bullets to
its bullet list in place. In both cases, the file is written once with the final result — do
not write partial updates.

### 7b. Update `kanban/PLAN.md`

**Be exhaustive:** Cross-reference EVERY `- [ ]` AC in the current milestone against the
changed files from Step 2 and the card descriptions from Step 3. Do not rely only on what the
changelog draft mentions. For each unchecked AC ask: "Did any changed file this session satisfy
this?" If uncertain, lean toward including it in the proposed list.

**Before writing anything**, present the proposed AC changes to the user for review:

```
─────────────────────────────────────────
  PROPOSED AC UPDATES — PLAN.md
─────────────────────────────────────────
  The following ACs appear to have been satisfied this session:

    [x] [AC text 1]
    [x] [AC text 2]

  The following ACs remain open (not satisfied):

    [ ] [AC text 3]
    [ ] [AC text 4]

  Does this look correct? (y to apply, or describe any changes)
─────────────────────────────────────────
```

**Wait for user confirmation.** If the user requests changes (e.g., uncheck an AC, check an
additional one), adjust the list accordingly and confirm the final set before writing.

Once the user approves, apply the changes to PLAN.md:
- Check off approved ACs: change `- [ ]` to `- [x]`

**Milestone Completion Check:** After updating ACs, check: are ALL ACs for the current
milestone now `- [x]`? If yes:
- Update `**Status:** IN PROGRESS` → `**Status:** COMPLETE`
- Add `**Completed:** YYYY-MM-DD` below the status line
- Flag for Step 7f

### 7c. Update `.claude/context/progress.md`

- Update `last_updated` in frontmatter to current datetime (ISO format)
- Increment `version` by 0.1
- Update **Current Status** section to reflect what was completed this session
- Update **Recent Commits** table (note: will be stale until Step 9 commits — update after push)
- Update milestone AC checkboxes to match PLAN.md
- Update **Immediate Next Steps** based on what's still outstanding

### 7d. Delete completed ongoing and backlog cards

**Ongoing cards:** For each card in `kanban/ongoing/` whose ACs are all satisfied after this
session — delete it: `rm kanban/ongoing/[card-name].md`

**Backlog cards:** Also check `kanban/backlog/`. For each card whose described feature was
implemented this session (compare its ACs against the git diff from Step 2) — delete it. A
backlog card can be completed without ever moving to `ongoing/`.

Report which files were deleted. If nothing to delete, skip.

### 7e. Clean up local plan files

```bash
rm -f .claude/plans/*.md
```

Plan files are ephemeral. The authoritative plan lives in `~/.claude/plans/`. Any file in the
local `.claude/plans/` is a stale scratch artifact — delete unconditionally. Never stage or
commit from this directory.

### 7f. Milestone Completion Entry (conditional — only if Step 7b flagged completion)

The `## 🏁 Milestone` entry was already drafted and approved in Step 6. Confirm it will be
inserted above the sprint entry in Step 7a. If Step 7a already ran, insert it now.

---

## STEP 8 — Gate: User Confirmation Before Commit

Before rendering the gate, compile which milestone ACs changed from `[ ]` to `[x]` in Step 7b.

Print a clear summary and **wait for user approval** before proceeding. The gate display varies
by branch type detected in the Preamble:

### Sprint close gate (`sprint/N`)

```
─────────────────────────────────────────
  READY TO CLOSE SPRINT N
─────────────────────────────────────────
  Current branch: sprint/N

  Step 1 — Commit docs to sprint/N:
    Message: chore(sprint): ceremony closing — Sprint N docs and changelog

    ACs checked off this session:
      [x] [AC text] — or "(none)" if no ACs changed

    Milestone reached: [Name] / NO

    Files to stage:
      M  kanban/CHANGELOG.md
      M  kanban/PLAN.md
      M  .claude/context/progress.md
      M  [all other modified files]

  Step 2 — Merge sprint/N → main:
    git checkout main && git merge sprint/N --no-ff
    Merge commit message: chore(sprint): close Sprint N — [theme]

  Step 3 — Tag:
    git tag -a v0.N.0 -m "Sprint N: [theme]"

  Step 4 — Push:
    git push origin main --tags

  Step 5 — Delete sprint branch:
    git branch -d sprint/N && git push origin --delete sprint/N

  Proceed with all steps? (y/n)
─────────────────────────────────────────
```

### Feature/fix/experiment close gate (`feature/*`, `fix/*`, `experiment/*`)

```
─────────────────────────────────────────
  READY TO CLOSE FEATURE: feature/[name]
─────────────────────────────────────────
  Current branch:  feature/[name]
  Merges back to:  sprint/N  (detected parent)

  Step 1 — Commit to feature/[name]:
    Message: feat(scope): description

    ACs checked off this session:
      [x] [AC text] — or "(none)"

    Files to stage:
      M  [modified files]

  Step 2 — Squash-merge into sprint/N:
    git checkout sprint/N
    git merge --squash feature/[name]
    git commit -m "feat(scope): description"

  Step 3 — Push sprint/N & delete feature branch:
    git push origin sprint/N
    git branch -d feature/[name]
    git push origin --delete feature/[name]

  Proceed with all steps? (y/n)
─────────────────────────────────────────
```

**If the user declines:** Leave all files as-is. Tell the user they can adjust and re-run
`/work:ceremony-closing`, or commit manually. Exit.

---

## STEP 9 — Execute

### Sprint close execution

```bash
# 1. Commit all doc updates to sprint branch
git add [specific files — never git add -A]
git commit -m "$(cat <<'EOF'
chore(sprint): ceremony closing — Sprint N docs and changelog

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin sprint/N

# 2. Merge to main (--no-ff preserves sprint branch history as a unit)
git checkout main
git pull origin main
git merge sprint/N --no-ff -m "$(cat <<'EOF'
chore(sprint): close Sprint N — [theme]

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# 3. Tag the merge commit
git tag -a v0.N.0 -m "Sprint N: [theme]"

# 4. Push main + tags
git push origin main --tags

# 5. Delete sprint branch
git branch -d sprint/N
git push origin --delete sprint/N
```

After completion, update `.claude/context/progress.md` **Recent Commits** table with the
merge commit hash.

Print final summary:
```
─────────────────────────────────────────
  SPRINT N CLOSED
─────────────────────────────────────────
  Merge commit: [hash] on main
  Tag: v0.N.0
  Sprint branch: sprint/N deleted

  Changelog: Sprint N added
  Docs: PLAN.md, progress.md updated

  Next: git checkout -b sprint/[N+1] main

  Caveats:
  - Code analysis verified structure but cannot validate gameplay feel
  - Manual browser testing still required before shipping
─────────────────────────────────────────
```

### Feature/fix/experiment branch execution

```bash
# 1. Commit all changes to the feature branch
git add [specific files — never git add -A]
git commit -m "$(cat <<'EOF'
feat(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin [current branch]
```

After committing, detect the parent sprint branch:

```bash
# Find which sprint branch this feature branched from
git log --oneline --decorate | grep "sprint/"
# Or: git for-each-ref --format='%(refname:short)' refs/heads/sprint/
# Pick the sprint branch whose tip is the merge-base of HEAD
```

Then merge the feature back into the sprint branch and delete it:

```bash
FEATURE_BRANCH=$(git branch --show-current)
SPRINT_BRANCH=[detected sprint branch, e.g. sprint/7]

git checkout $SPRINT_BRANCH
git merge --squash $FEATURE_BRANCH
git commit -m "$(cat <<'EOF'
feat(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin $SPRINT_BRANCH
git branch -d $FEATURE_BRANCH
git push origin --delete $FEATURE_BRANCH
```

If no sprint branch can be detected (unusual), stop and ask the user which sprint branch to
merge into before proceeding.

Print final summary:
```
─────────────────────────────────────────
  FEATURE CLOSED
─────────────────────────────────────────
  Committed: [hash] on feature/[name]
  Merged (squash): into sprint/N
  Deleted: feature/[name] (local + remote)

  sprint/N is now up to date. Continue work there,
  or run /work:ceremony-closing from sprint/N to close the sprint.

  Caveats:
  - Code analysis verified structure but cannot validate gameplay feel
  - Manual browser testing still required before shipping
─────────────────────────────────────────
```

---

## Caveats & Limitations

1. **Gameplay feel** — `analyze-code` checks code quality and architecture; it cannot verify
   that the game feels correct. Manual browser testing is always required before shipping.

2. **Sprint vs session** — Sprints have no formal AC list in PLAN.md. A sprint is "done" when
   you decide it is. The ceremony checks off **milestone** ACs that happen to be satisfied.

3. **Push gate is opt-in** — If the user declines at Step 8, files are updated but not
   committed. Re-run to retry, or commit manually.

4. **Port conflicts** — Dev server (5173, 3000) and Storybook (6006) checks will fail if
   those ports are already in use. Kill existing processes first.

5. **Storybook optional** — If Storybook is not set up in the project, the Storybook check
   is skipped with a note.

6. **Branch hierarchy** — `feature/*` closes into `sprint/N`; `sprint/N` closes into `main`.
   Running ceremony-closing on a `feature/*` branch fully closes that feature (commit →
   squash-merge to sprint → delete). Running it on `sprint/N` closes the sprint (commit →
   merge to main → tag → delete). These are distinct operations; each is complete on its own.

---

## FINAL STEP — Persist Session Context

Run `/context:update` to persist session state to `.claude/context/`.
