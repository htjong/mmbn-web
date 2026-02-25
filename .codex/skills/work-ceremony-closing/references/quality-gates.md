# Quality Gates (Strict Order)

1. `npm run type-check` (stop on errors)
2. `npm run lint` (stop on errors)
3. `npm run test` (stop on failures; summarize failures)
4. `npm run test:e2e` (stop on failures; if environment cannot launch browser, report as blocker with remediation command)
5. Dev server health check (stop on startup errors/port conflicts)
6. Storybook health check (skip only if unavailable)
7. Backlog orchestrator gate (conditional):
   - Run when any changed file matches one of:
     - `kanban/backlog/*.md`
     - `kanban/backlog/evidence/*.json`
     - `scripts/backlog-orchestrate.mjs`
     - `scripts/run-playwright.mjs`
     - `.codex/skills/backlog-orchestrate/**`
   - Command:
     - `npm run orchestrate:backlog` (dry verification)
     - For each touched backlog card, run: `node scripts/backlog-orchestrate.mjs --mode execute --card <card-path>`
   - Stop on any `blocked|failed|intake_failed`.

Report each gate as pass/fail/skip before continuing.

## Gate Failure Remediation

- If a gate fails due to port/process conflicts, ask for explicit user confirmation before terminating any process.
- After confirmation, terminate only conflicting processes and rerun only failed/blocked gates (preserving gate order).
- If confirmation is not granted, stop and report blocker details plus the exact rerun command(s) needed.
- If e2e/orchestrator fails due to missing dependencies or browser install, stop and report exact install/remediation commands.
