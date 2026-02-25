---
name: work-ceremony-opening
description: Run session opening ceremony for this repo - verify clean state, orient sprint/branch status, check remote sync, load context, define scope, and recommend or create the correct branch. Use when starting a development session.
---

# Work Ceremony Opening

## Intent Invariants
- Stop immediately if working tree is dirty.
- Always classify branch mode before planning work.
- Never auto-pull; surface sync state and let user decide.
- Set explicit session scope before branch operations.

## Claude -> Codex Compatibility Map
- Legacy `/work:ceremony-opening` command -> skill workflow.
- Legacy question prompts -> direct concise user questions when choices are needed.
- Legacy context runtime paths -> `.codex/context/*`.

## Workflow
1. **Preamble gate:** run `git status --porcelain`; if non-empty, print dirty files and stop.
2. **Branch orientation:** detect `sprint/N`, sub-branch (`feature/*`, `fix/*`, `experiment/*`), `main`, unknown; include merged-sprint edge detection from `references/branch-cases.md`.
3. **Sync check:** run fetch + `git status -sb`; report up-to-date/behind/diverged without pulling.
4. **Context briefing:** optionally prime context, then produce briefing using `references/session-briefing-template.md`.
5. **Scope setting:** ask one focused question to choose ongoing card, backlog card, ad hoc work, or feature pipeline.
6. **Branch recommendation:** follow scenario table in `references/branch-cases.md`; ask confirmation before creating branches.

## Output Contract
- Must include: branch mode, sync state, session briefing, scope choice, branch recommendation.
