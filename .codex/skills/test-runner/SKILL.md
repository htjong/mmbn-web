---
name: test-runner
description: Execute tests and provide failure analysis with prioritized fixes. Use when the user asks to validate changes, debug failing tests, or assess test health.
---

# Test Runner

## Intent Invariants
- Run the smallest relevant test scope first, then expand as needed.
- Capture logs for failed runs.
- Distinguish product defects from flaky/environmental failures.

## Claude -> Codex Compatibility Map
- Legacy test-and-log helper path -> `.codex/scripts/test-and-log.sh`.
- Multi-agent diagnosis -> equivalent single-session deep failure analysis unless user requests parallelization.

## Workflow
1. Select scope (targeted, package-level, or full-suite).
2. Execute tests and capture command, duration, pass/fail counts.
3. If failing, capture detailed logs and analyze root causes.
4. Provide prioritized fixes and rerun recommendations.

## Output Contract
- Use `references/output-format.md`.
