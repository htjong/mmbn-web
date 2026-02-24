# Quality Gates (Strict Order)

1. `npm run type-check` (stop on errors)
2. `npm run lint` (stop on errors)
3. `npm run test` (stop on failures; summarize failures)
4. Dev server health check (stop on startup errors/port conflicts)
5. Storybook health check (skip only if unavailable)

Report each gate as pass/fail/skip before continuing.
