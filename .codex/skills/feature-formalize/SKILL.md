---
name: feature-formalize
description: Formalize a chosen feature direction into an implementable backlog card with acceptance criteria and architecture risk checks. Use when the user asks to convert an idea into delivery-ready scope.
---

# Feature Formalize

## Intent Invariants
- Require a concrete chosen direction before drafting.
- Ask 2-4 clarifying gameplay questions that materially change acceptance criteria.
- Produce testable acceptance criteria and run architecture checks before finalization.

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

## Output Contract
- Backlog card must follow required template and include key-file notes.
