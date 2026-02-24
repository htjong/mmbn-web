---
name: analyze-code
description: Perform deep code-change analysis for bugs, regressions, and risky logic paths. Use when the user asks for a review, bug hunt, regression analysis, or root-cause tracing across one or more files.
---

# Analyze Code

## Intent Invariants
- Prioritize defects by severity, with critical findings first.
- Validate findings from current code; avoid speculative claims.
- Include concrete file references and actionable fixes.

## Claude -> Codex Compatibility Map
- "Task subagent" orchestration -> perform equivalent deep review in this session unless explicitly delegated.
- Verbose persona framing -> keep only behavior-critical review steps.
- Custom output schema -> use the required schema in `references/output-format.md`.

## Workflow
1. Identify scope from changed files or requested modules.
2. Trace execution/data flow across boundaries and failure paths.
3. Check bug classes: null handling, state corruption, race conditions, security, boundary errors, contract mismatches.
4. Confirm each finding with evidence in code.
5. Report findings using required output format.

## Output Contract
- Follow `references/output-format.md` exactly.
