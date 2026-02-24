---
name: feature-explore
description: Explore 3-4 distinct gameplay directions and capture one chosen direction. Use when a feature idea needs design divergence before implementation planning.
---

# Feature Explore

## Intent Invariants
- Stay in gameplay design space; do not perform implementation planning.
- Generate genuinely distinct directions (not cosmetic variants).
- Persist exactly one chosen direction to `kanban/ideas`.

## Claude -> Codex Compatibility Map
- `/feature:explore` command loop -> skill-guided interactive refinement.
- Existing card overwrite behavior -> keep explicit replacement confirmation when chosen direction exists.

## Workflow
1. Resolve input (idea card path or freeform text).
2. Produce 3-4 distinct directions using template in `references/chosen-direction-template.md`.
3. Iterate with user until one direction is selected.
4. Persist chosen direction in existing/new idea card.
5. Hand off to `feature-formalize`.
