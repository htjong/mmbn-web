---
name: analyze-file
description: Analyze and summarize verbose files (especially logs) into high-signal findings. Use when the user asks to inspect large output files, test logs, diagnostics, or multi-file traces.
---

# Analyze File

## Intent Invariants
- Read only requested files.
- Preserve critical identifiers and exact error text when needed.
- Reduce verbosity without dropping actionable details.

## Claude -> Codex Compatibility Map
- Claude log-analysis agent behavior -> same behavior in a single Codex run.
- Token-reduction target -> enforce concise grouped summaries, not strict percentage quotas.

## Workflow
1. Verify each requested file exists and is readable.
2. Extract critical events: errors, failures, warnings, timestamps, unique identifiers.
3. Group duplicates and count occurrences.
4. Produce concise structured findings with recommendations.

## Output Contract
- Follow `references/output-format.md`.
