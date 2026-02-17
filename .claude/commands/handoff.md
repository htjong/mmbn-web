Update PROJECT_CONTEXT.md based on this session and the current repo state.

Process:
1. Read the current PROJECT_CONTEXT.md
2. Run `git status`, `git log --oneline -10`, and `git diff --stat` to understand recent changes
3. Review what happened in this conversation — decisions, blockers, direction changes, reasoning
4. Update PROJECT_CONTEXT.md — replace stale sections, keep it concise
5. Output a short "Resume Checklist" (3-5 bullets) summarizing what a new session should do first

Rules:
- Preserve all section headers exactly as they are (# Current Goal, # Architecture, # Decisions Made, # What Changed Recently, # Known Issues / Open Questions, # Next Steps, # How to Resume). Never rename, merge, reorder, or remove headers — only update the content beneath them.
- Keep PROJECT_CONTEXT.md under 200 lines total
- Capture decisions and the reasoning behind them from this conversation
- Only write what you can verify from files, git, or this conversation
- If uncertain about something, add it to "Known Issues / Open Questions"
- Delete information that is no longer relevant
- Do not rewrite sections that haven't changed
