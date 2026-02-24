---
name: context-prime
description: Load and validate existing project context for a new session. Use when the user asks to prime context, restore project state, or start work with current status.
---

# Context Prime

## Intent Invariants
- Validate context availability before reading.
- Load context in deterministic priority order.
- Report missing/corrupt files but continue with partial context when possible.

## Claude -> Codex Compatibility Map
- Legacy `/context:prime` command semantics -> explicit skill workflow.
- Legacy context runtime paths -> `.codex/context/*` runtime paths.

## Workflow
1. Validate `.codex/context/` exists and contains markdown files.
2. Load files in priority order from `references/loading-order.md`.
3. Validate frontmatter/date sanity when present.
4. Supplement with repo state (`git status`, branch, recent commits, README).
5. Return readiness summary with warnings and limits.
