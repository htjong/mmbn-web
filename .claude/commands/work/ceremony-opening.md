---
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# /work:ceremony-opening

You are the opening ceremony orchestrator for a coding session. Your job is to orient the
developer, sync the repo, load context, set scope, and set up the right branch — all from
this single command.

**Precondition:** The working tree must be clean (no staged or uncommitted changes). If it
isn't, stop immediately and tell the user to commit or stash their changes first before
re-running.

---

## PREAMBLE — Verify Clean State

```bash
git status --porcelain
```

If output is non-empty:
- Print the dirty files
- **STOP.** Tell the user: "Your working tree has uncommitted changes. Commit, stash, or
  discard them before running `/work:ceremony-opening`."

If clean: proceed.

---

## STEP 1 — Branch Orientation

```bash
git branch --show-current
git log --oneline -5
git for-each-ref --format='%(refname:short)' refs/heads/sprint/ refs/remotes/origin/sprint/
```

Classify the current branch:

| Branch pattern | Classification | Notes |
|---|---|---|
| `sprint/N` | **Active sprint** | Normal — work here or branch off it |
| `feature/*`, `fix/*`, `experiment/*` | **Sub-branch** | Show commits ahead of parent sprint |
| `main` | **On main** | No active sprint — one needs to be created |
| anything else | **Unknown** | Warn the user |

**Special cases to detect:**

- **On `main` with no open sprint branch:** Warn: "No active sprint branch detected. You'll
  need to create one. Step 5 will handle this."

- **On a sprint branch that was already merged to main:** Check with:
  ```bash
  git merge-base --is-ancestor HEAD origin/main && echo "MERGED" || echo "OPEN"
  ```
  If MERGED: warn "This sprint appears to already be closed. Did you mean to start a new
  sprint? Step 5 will help."

- **On a sub-branch:** Show how many commits ahead of the parent sprint:
  ```bash
  git log sprint/N..HEAD --oneline
  ```
  Report the parent sprint name and commit count.

Print a one-liner report before proceeding:

```
Branch: sprint/7
Mode: ACTIVE SPRINT — continuing sprint work
```

---

## STEP 2 — Sync Check

```bash
git fetch origin 2>&1
git status -sb
```

Parse the output and report one of:

- `✅ up to date with origin/[branch]`
- `⚠️  N commits behind origin/[branch]` — print: "Run `git pull origin [branch]` to sync
  before starting work."
- `⚠️  diverged from origin/[branch] (N ahead, M behind)` — print: "Your branch has
  diverged from remote. Resolve before continuing."

**Do not auto-pull.** Surface the information and let the user decide.

---

## STEP 3 — Context Load / Session Briefing

First, ask the user:
> "Should I load context into this session?

If yes, run `/context:prime` to inject session state from `.claude/context/`.

Then, read the following files **silently** (do not dump full contents to the user):

- `kanban/PLAN.md` — current milestone name, goal, full AC list (count checked vs total)
- `kanban/CHANGELOG.md` — most recent sprint entry only (what shipped last)
- `.claude/context/progress.md` — (if file exists) last known test/type-check status and last updated date 
- `kanban/ongoing/` — list all cards, read each one for a one-line summary
- `kanban/backlog/` — list card filenames only (do not read full content)

Then print a **Session Briefing**:

```
─────────────────────────────────────────────────────
  SESSION BRIEFING — YYYY-MM-DD
─────────────────────────────────────────────────────
  Milestone:  [Name] ([STATUS])
  Progress:   N / M ACs complete

  Open ACs:
    [ ] [AC text]
    [ ] [AC text]
    ...

  Active work (kanban/ongoing/):
    • [card-filename] — [one-line summary]
    • [card-filename] — [one-line summary]
    (none) ← if empty

  Queued next (kanban/backlog/):
    • [card-filename]
    • [card-filename]
    (none) ← if empty

  Last shipped ([Sprint N]):
    [one-line summary of last CHANGELOG sprint entry]

  Last known health:
    Tests: N/N passed  |  TypeScript: clean  |  Updated: YYYY-MM-DD
─────────────────────────────────────────────────────
```

If `progress.md` has no health data, omit the health line.

---

## STEP 4 — Scope Setting / Sprint Planning

After printing the briefing, use `AskUserQuestion` with a **single question**:

- **Header:** "Today's focus"
- **Question:** "What are you working on this session?"
- **Options** (populate dynamically from Step 3, max 4):
  - For each ongoing card (up to 2): label = card filename (without `.md`), description =
    one-line AC summary from the card
  - "Start a new backlog card" — description: "Pick up the next queued item from backlog"
  - "Something ad hoc / not in the kanban" — description: "Unplanned work or exploration"
  - "Explore a new idea with `/feature:explore`
  - "Formalize an existing idea with `/feature:formalize`

  If there are more than 2 ongoing cards, collapse them: label = "Continue ongoing work",
  description = "N cards in progress — [list names]".

Based on the user's answer, set a **session scope** for Step 5:

- **Ongoing card:** Note which card is being continued. Summarize its remaining open ACs
  for the user in 1-3 lines.
- **New backlog card:** Read the card fully. Print its description and open ACs as a
  quick summary. Proceed to Step 5 to set up a branch.
- **Ad hoc:** Ask for a one-line description of the work (plain text response). Proceed to
  Step 5.

---

## STEP 5 — Branch Recommendation

Based on the session scope and current branch, determine the right action. Present a
recommendation and ask for confirmation before executing anything.

---

### Scenario A — Already on the right branch

If the user is already on a `feature/*` or `fix/*` branch that matches the work, confirm
and stop:

```
✅ Already on feature/[name] — ready to continue.
```

---

### Scenario B — New sub-branch needed (feature/fix work off sprint/N)

If on `sprint/N` and the scope warrants isolation (distinct feature, multi-file change,
risky/experimental work):

Suggest a branch name based on the scope. For example, if the user chose a backlog card
named `game-start-menu.md`, suggest `feature/game-start-menu`.

```
Recommended: create a sub-branch for this work.

  git checkout -b feature/[suggested-name] sprint/N

Create this branch? (y/n)
```

If yes:
```bash
git checkout -b feature/[suggested-name]
```

Confirm: `✅ Branch feature/[name] created off sprint/N.`

---

### Scenario C — PM/docs work only (commit directly to sprint branch)

If the scope is kanban updates, docs, small config changes, or other low-risk PM work,
no sub-branch is needed:

```
✅ PM/docs work goes directly on sprint/N — no sub-branch needed.
```

---

### Scenario D — New sprint branch needed

Triggered when: on `main` with no open sprint, or the active sprint is already merged, or
the user explicitly says they're starting a new sprint.

Determine the next sprint number:

```bash
# Get all sprint branches (local + remote), sort by version, take the highest N
git for-each-ref --format='%(refname:short)' refs/heads/sprint/ refs/remotes/origin/sprint/ \
  | grep -oE '[0-9]+$' | sort -n | tail -1
```

Add 1 to get N. (If no sprint branches exist yet, start at 1.)

Present the full plan:

```
─────────────────────────────────────────────────────
  OPEN NEW SPRINT
─────────────────────────────────────────────────────
  No active sprint detected. Ready to open Sprint N.

  Actions:
    1. git checkout main && git pull origin main
    2. git checkout -b sprint/N
    3. Insert blank Sprint N entry in kanban/CHANGELOG.md

  Proceed? (y/n)
─────────────────────────────────────────────────────
```

If yes, execute:

```bash
git checkout main
git pull origin main
git checkout -b sprint/N
```

Then insert a blank sprint entry at the top of `kanban/CHANGELOG.md`, immediately after
the intro block (before the previous sprint entry). The separator `---` before the
previous entry must remain:

```markdown
## Sprint N: [TBD]
**Date:** TBD

_(Sprint opened — title, date, and bullets will be filled in by `/work:ceremony-closing`.)_

---
```

Confirm:

```
✅ Branch sprint/N created from main.
✅ Blank Sprint N entry added to CHANGELOG.md.
   ceremony-closing will fill in the title, date, and work summary when the sprint closes.
```

If the user chose a specific backlog card to work on (from Step 4), also offer to create a
sub-branch now per Scenario B. If yes, execute that too.

---

## FINAL OUTPUT

Print a ready-to-go summary:

```
─────────────────────────────────────────────────────
  READY TO WORK
─────────────────────────────────────────────────────
  Branch:    [current branch]
  Focus:     [one-line description of today's scope]
  Milestone: [Name] — N / M ACs complete

  When done: run /work:ceremony-closing to commit, push,
  update docs, and check off milestone ACs.
─────────────────────────────────────────────────────
```
