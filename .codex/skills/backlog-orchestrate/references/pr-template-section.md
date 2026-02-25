# PR Payload Sections

Every orchestrated card PR payload must include these sections in order:

1. `## Summary`
2. `## Acceptance Criteria Trace`
3. `## Test Evidence`
4. `## Review Findings`
5. `## Risks`
6. `## Rollback Notes`

## Acceptance Criteria Trace
Use a table with columns:
- `AC`
- `Status`
- `Unit`
- `Integration`
- `Storybook`
- `E2E`
- `TDD Proof`

All rows must be `pass` for readiness.
