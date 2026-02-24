---
name: feature-formalize
description: Formalize a chosen feature direction into an implementable backlog card with acceptance criteria and architecture risk checks. Use when the user asks to convert an idea into delivery-ready scope.
---

# Feature Formalize

## Intent Invariants
- Require a concrete chosen direction before drafting.
- Ask 2-4 clarifying gameplay questions that materially change acceptance criteria.
- Produce testable acceptance criteria and run architecture checks before finalization.
- Maintain idea-to-backlog lifecycle hygiene: after successful formalization, delete the source idea card from `kanban/ideas/`.

## Claude -> Codex Compatibility Map
- `/feature:formalize` command flow -> equivalent skill workflow.
- Claude Task-based architecture review -> equivalent in-session review checklist from `references/architecture-review-checklist.md`.

## Workflow
1. Resolve chosen direction from card path or user text.
2. Read architecture anchor files in shared/client modules.
3. Ask clarifying questions and wait for answers.
4. Draft backlog card with template from `references/backlog-card-template.md`.
5. Run architecture checklist and surface blockers.
6. Revise with user feedback, then save to `kanban/backlog/`.
7. If formalization is successful and source came from `kanban/ideas/`, delete the corresponding idea card.

## Output Contract
- Backlog card must follow required template and include key-file notes.
- On successful formalization from an idea card path, the idea card is removed from `kanban/ideas/`.
