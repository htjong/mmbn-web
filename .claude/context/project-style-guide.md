---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T02:35:20Z
version: 1.0
author: Claude Code PM System
---

# Project Style Guide

## TypeScript Conventions

- **Strict mode on** — No `any`, no broken types
- **Interfaces over types** for object shapes where extension is plausible
- **Plain objects over classes** for game state — `BattleState` is a plain object, not a class
- **Classes only for stateful controllers** — `SimpleAI`, `InputHandler`, `BattleScene`, renderers
- **Explicit return types** on public functions
- **No unused variables or parameters** — TypeScript enforces this

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files (classes) | PascalCase | `BattleEngine.ts`, `GridRenderer.ts` |
| Files (data/utils) | camelCase | `chips.ts`, `validation.ts` |
| Files (kanban cards) | kebab-case | `chip-select-overlay.md` |
| Classes | PascalCase | `class SimpleAI`, `class BattleScene` |
| Interfaces/Types | PascalCase | `BattleState`, `PlayerAction` |
| Functions/methods | camelCase | `applyAction()`, `getNextAction()` |
| Constants | camelCase (local), UPPER_SNAKE (module-level) | `const MAX_HP = 200` |
| Player IDs | string literals | `'player1'`, `'player2'` |

## Import Conventions

```typescript
// Cross-package (preferred)
import { BattleEngine } from '@mmbn/shared';

// Within shared/ or server/ — MUST use .js extension
import { GridSystem } from './GridSystem.js';
import { Chip } from '../types/Chip.js';

// Within client/ — no extension needed (Vite resolves)
import { InputHandler } from '@client/input/InputHandler';
```

## File Structure Pattern

Co-locate tests with source:
```
BattleEngine.ts
BattleEngine.test.ts     // same directory
```

## Comment Style

- **No comments for self-evident code** — if you need a comment to explain what code does, consider renaming
- **Comments for non-obvious decisions** — "Why" not "What"
- **No docstrings on private/internal helpers**
- **JSDoc only on public API** (exported functions in `shared/index.ts`)

## Commit Message Format

Conventional commits — required:
```
feat(scope): short description
fix(scope): short description
docs(scope): short description
refactor(scope): short description
test(scope): short description
```

Scopes: `battle`, `client`, `server`, `shared`, `infra`, `docs`, `kanban`

## Git Workflow

- **Never commit to main directly**
- Branch types: `feature/`, `fix/`, `experiment/`, `hotfix/`
- Branches are short-lived (< 3 days ideally)
- See `docs/BRANCHING.md` for full strategy

## Code Review Checklist (before committing)

1. `npm run type-check` — must pass
2. `npm run test:shared` — must pass (battle logic is critical)
3. `npm run lint` — must pass
4. No new patterns introduced without documenting in CLAUDE.md
5. Kanban card updated if applicable

## Phaser-Specific Patterns

- Keep game logic out of Phaser scenes — scenes call `BattleEngine`, they don't implement logic
- Renderers are stateless — accept state, draw to scene, return nothing
- Use `this.scene.add` / Phaser factories in scenes, not raw DOM manipulation

## React-Specific Patterns

- React handles UI overlays only — never touch the Phaser canvas from React
- Zustand store is the bridge between Phaser state and React UI
- Keep components small and focused on display

## What NOT to Do

- Don't add comments that restate what the code does
- Don't add error handling for impossible cases (trust internal guarantees)
- Don't create abstractions for one-time use
- Don't design for hypothetical future requirements
- Don't import server code into shared, or shared logic into client-specific paths that bypass the package boundary
