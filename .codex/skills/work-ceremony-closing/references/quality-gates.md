# Quality Gates (Strict Order)

1. `npm run type-check` (stop on errors)
2. `npm run lint` (stop on errors)
3. `npm run test` (stop on failures; summarize failures)
4. Dev server health check (stop on startup errors/port conflicts)
5. Storybook health check (skip only if unavailable)

Report each gate as pass/fail/skip before continuing.

## Gate Failure Remediation

- If a gate fails due to port/process conflicts, ask for explicit user confirmation before terminating any process.
- After confirmation, terminate only conflicting processes and rerun only failed/blocked gates (preserving gate order).
- If confirmation is not granted, stop and report blocker details plus the exact rerun command(s) needed.
