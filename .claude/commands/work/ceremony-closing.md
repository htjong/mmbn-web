---
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task, AskUserQuestion
---

# /work:ceremony-closing

You are the closing ceremony orchestrator for a coding session. Your job is to verify the
codebase is healthy, analyze code quality, update all living documents, and commit/push
cleanly — all from this single command.

**Do not rush or skip steps.** Each step has a gate. Fail fast and loud if something is wrong.

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
npm run test
```

- Zero failures required.
- Raw output will be large. Write it to a temp file, then spawn an `analyze-file` agent to
  summarize it. Only the compact summary comes back to the main window.

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
✅ tests — 32/32 passed
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
git log --oneline -5
```

- Collect the full list of modified files (tracked unstaged + staged).
- If the working tree is completely clean (no changes), report this clearly and ask:
  "Working tree is clean — nothing to commit. Did you mean to run this? (y to continue,
  n to stop)"
  If the user says no, exit gracefully.
- Save the list of changed files for Steps 4 and 8.

---

## STEP 3 — Context Load: What Was This Sprint About?

Read these files silently (do not dump their full contents to the user):

- `kanban/PLAN.md` — identify the current sprint name and its acceptance criteria
- `kanban/CHANGELOG.md` — read the most recent sprint header to determine the next sprint
  number
- `.claude/context/progress.md` — current project status snapshot
- List files in `kanban/ongoing/` — these describe the active work cards

After reading, produce a concise internal summary:
- Current sprint name and goal
- Which AC items are already checked off
- What the ongoing cards describe
- What this session appears to have completed (based on changed files + card descriptions)

Output to the user (1-3 sentences):
> "This session completed: [X], [Y], [Z]."

---

## STEP 4 — Code Analysis: Quality Gate

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

Using the git diff from Step 2 and the sprint context from Step 3, produce concise
purpose-oriented bullet points of what changed and *why*:

- Focus on intent ("Added X so that Y can happen"), not file names
- 3-8 bullets
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

Using the current date and time (run `date "+%Y-%m-%d %H:%M %Z"` to get it), and the sprint
context from Step 3, draft a new changelog entry following the existing format exactly:

```markdown
## Sprint N: [Title]
**Date:** YYYY-MM-DD HH:MM PST

- [bullet from Step 5]
- [bullet from Step 5]
- [bullet from Step 5]

**Key decisions:**
- [any architectural or design choices made this session, or omit this section if none]
```

Rules:
- Sprint N = last sprint number + 1 (read from CHANGELOG.md)
- Title should be 2-5 words capturing the session's theme
- Date must include time and timezone (PST or PDT depending on current time)
- Bullets are purpose-oriented, not file-name-oriented
- Note which PLAN.md acceptance criteria are now satisfied (mention them by name)

Present the draft to the user for review before writing anything.

---

## STEP 7 — Document Updates

Once the user approves the changelog draft (or you have proceeded past Step 6 with their
implicit approval), write all document updates at once:

### 7a. Prepend to `kanban/CHANGELOG.md`

Insert the new sprint entry at the top of the file (after the `# Changelog` header and
`---` separator, before the previous latest sprint).

### 7b. Update `kanban/PLAN.md`

For each acceptance criterion in the current sprint that this session satisfied:
- Check it off: change `- [ ]` to `- [x]`

If **all** acceptance criteria in the current sprint are now checked:
- Mark the sprint `COMPLETE` (update the `**Status:**` line to `COMPLETE`)
- Add a note: "**Completed:** YYYY-MM-DD"
- The next sprint becomes current (update the section header or status accordingly)

### 7c. Update `.claude/context/progress.md`

- Update `last_updated` in frontmatter to current datetime (ISO format)
- Increment `version` by 0.1
- Update **Current Status** section to reflect what was completed this session
- Update **Recent Commits** table (will be stale after commit — update after Step 9 if possible,
  or note that it will reflect after the commit)
- Update **First Playable Acceptance Criteria** checkboxes to match PLAN.md
- Update **Immediate Next Steps** based on what's still outstanding

### 7d. Delete completed ongoing cards

For each card in `kanban/ongoing/` whose acceptance criteria are all checked off after this
session:
- Delete the file: `rm kanban/ongoing/[card-name].md`
- Report which files were deleted

If `kanban/ongoing/` is empty, skip this step.

### 7e. Clean up local plan files

```bash
rm -f .claude/plans/*.md
```

Plan files are ephemeral. The authoritative plan for this session lives in `~/.claude/plans/`
(written there automatically by plan mode). Any file in the local `.claude/plans/` is a stale
scratch artifact — delete it unconditionally. Never stage or commit files from this directory.

---

## STEP 8 — Gate: User Confirmation Before Commit

Print a clear summary and **wait for user approval** before proceeding:

```
─────────────────────────────────────────
  READY TO COMMIT
─────────────────────────────────────────
  Branch:  [current branch]
  Message: feat(scope): description

  Files to stage:
    M  kanban/CHANGELOG.md
    M  kanban/PLAN.md
    M  .claude/context/progress.md
    M  [all other modified files from Step 2]

  Proceed with commit and push? (y/n)
─────────────────────────────────────────
```

Compose the commit message using conventional commit format:
- `feat(scope):` for new features
- `fix(scope):` for bug fixes
- `chore(scope):` for tooling/docs
- Scope = the primary area affected (e.g., `ui`, `battle`, `infra`, `docs`)
- Message body: 1-2 sentences summarizing what and why

**If the user declines:** Leave all files as-is (do not stage or commit anything). Tell the
user they can adjust and re-run `/work:ceremony-closing`, or commit manually. Exit.

---

## STEP 9 — Commit & Push

Stage only the files that should be committed — never `.env`, secrets, unrelated files, or
anything under `.claude/plans/` (plan files are ephemeral; see Step 7e):

```bash
git add [specific files only — never git add -A or git add .]
git commit -m "$(cat <<'EOF'
feat(scope): description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin [current branch]
```

After push succeeds:
- Report the commit hash
- Update `.claude/context/progress.md` **Recent Commits** table with the new commit

Print a final success summary:

```
─────────────────────────────────────────
  SESSION CLOSED
─────────────────────────────────────────
  Commit: [hash] on [branch]
  Changelog: Sprint N added
  Docs: PLAN.md, progress.md updated

  Caveats:
  - Code analysis verified structure but cannot validate gameplay feel
  - Manual browser testing still required before shipping
─────────────────────────────────────────
```

---

## Caveats & Limitations

These limitations apply every time:

1. **Gameplay feel** — `analyze-code` checks code quality and architecture; it cannot verify
   that the game feels correct. Manual browser testing is always required before shipping.

2. **Multi-sprint sessions** — If a session touched goals across multiple sprints, the
   changelog draft may need manual adjustment. Review the draft carefully.

3. **Push gate is opt-in** — If the user declines at Step 8, files are updated but not
   committed. Re-run to retry, or commit manually.

4. **Port conflicts** — Dev server (5173, 3000) and Storybook (6006) checks will fail if
   those ports are already in use. Kill existing processes first.

5. **Storybook optional** — If Storybook is not set up in the project, the Storybook check
   is skipped with a note.
