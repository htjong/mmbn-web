---
name: context-create
description: Create baseline project context documents in `.codex/context/`. Use when context does not exist or when bootstrapping a project for future sessions.
---

# Context Create

## Intent Invariants
- Confirm safe write conditions before creation.
- Use one real UTC timestamp for frontmatter consistency.
- Create the full baseline context file set.

## Claude -> Codex Compatibility Map
- Legacy `/context:create` flow -> skill workflow with same validation gates.
- Legacy context targets -> `.codex/context/*` targets.

## Workflow
1. Preflight: detect existing context and ask before overwrite.
2. Detect project type and repo state from manifests/git.
3. Create baseline files listed in `references/file-set.md`.
4. Apply frontmatter template from `references/frontmatter-template.md`.
5. Validate all created files are readable and non-empty.
6. Return creation summary and known unknowns.
