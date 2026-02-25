---
name: context-update
description: Update `.codex/context/` docs to reflect recent repository changes. Use at session end or when context files may be stale.
---

# Context Update

## Intent Invariants
- Always update `progress.md`.
- Update other context files only when corresponding project changes occurred.
- Preserve original `created`; only update `last_updated`.

## Claude -> Codex Compatibility Map
- Legacy `/context:update` workflow -> same selective-update policy.
- Legacy context references -> `.codex/context/*` references.

## Workflow
1. Validate `.codex/context/` exists.
2. Collect change signals from git status/log/diff and manifests.
3. Apply per-file policy from `references/update-policy.md`.
4. Update touched files with fresh `last_updated` timestamp.
5. Return concise delta summary.
