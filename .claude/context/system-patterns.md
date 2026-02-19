---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T02:35:20Z
version: 1.0
author: Claude Code PM System
---

# System Patterns

## Core Architectural Style

**Deterministic Pure State Machine** — The battle engine is a pure function with no side effects. Same inputs always produce same outputs. This enables client-side prediction and server-side validation from the same codebase.

## BattleEngine Pattern

```typescript
// Creation
BattleEngine.createInitialState(player1Id, player2Id, folder) → BattleState

// Game loop (called every frame)
BattleEngine.tick(state) → { state: BattleState, events: BattleEvent[] }

// Player/AI input
BattleEngine.applyAction(state, playerId, action) → { state: BattleState, events: BattleEvent[] }
```

- **Input:** current state + action
- **Output:** new state + events (never mutates)
- **State:** plain JSON-serializable objects (no class instances with methods)
- **Events:** side-effect notifications (e.g. `chip_selected`, `damage_dealt`) — consumers decide what to render

## Separation of Concerns (Three-Layer)

| Layer | Package | Responsibility |
|-------|---------|----------------|
| **Logic** | `shared` | Pure battle math — deterministic, no I/O |
| **Rendering** | `client` | Phaser game + React UI — stateful, visual |
| **Validation** | `server` | Re-runs same engine, rejects cheated inputs |

**Rule:** Never import client or server code into shared. Shared can be imported by either.

## Monorepo Pattern

npm workspaces. Cross-package imports use the `@mmbn/shared` package name, not relative paths. This lets both client and server resolve to the same shared build.

## Real-Time Game Model

Both players act simultaneously — no turn phases. The game loop is:
1. Increment frame
2. Fill both custom gauges independently
3. Process queued actions via `applyAction()`
4. Check game-over conditions
5. Emit events to renderers

## Renderer Pattern (Client)

Renderer classes are stateless helpers that accept `BattleState` and draw to Phaser:
```typescript
GridRenderer.render(scene, state)
NaviRenderer.render(scene, state)
ChipRenderer.render(scene, state, selectedChips)
```

Renderers own no game logic — they only translate state to pixels.

## Input Pattern (Client)

`InputHandler` uses `keysJustPressed` tracking — each key produces exactly one action per physical press. Holding does not repeat. This matches MMBN3 input feel and prevents input flooding.

## AI Pattern

`SimpleAI` is a client-side controller that submits actions through the same `applyAction()` interface as a human player. It is **not** deterministic (uses `Math.random()`). It runs only in campaign mode — server-authoritative PVP would use a server-side AI.

```typescript
const ai = new SimpleAI();
const action = ai.getNextAction(aiPlayerId, state); // PlayerAction | null
```

## Network Validation Pattern

All Socket.io messages are validated with Zod schemas in `packages/shared/src/types/NetworkMessages.ts`. The server re-runs `BattleEngine.applyAction()` for every input received — if invalid, it rejects without applying. The client does the same optimistically (client-side prediction).

## Data Pattern (Chips & Viruses)

Game content is defined as plain data objects, not classes:
```typescript
// chips.ts
{ id: string, name: string, element: Element, damage: number, effects: ChipEffect[], description: string }
```

Adding a chip = add data + implement effect handler in `ChipSystem.ts`. No architectural changes.

## ESM Import Rule

All relative imports in `packages/shared/` and `packages/server/` MUST use `.js` extensions:
```typescript
import { GridSystem } from './GridSystem.js'; // correct
import { GridSystem } from './GridSystem';    // fails in production
```

Client (Vite) is exempt — Vite handles resolution internally.

## Kanban Workflow Pattern

Card location = status. `kanban/ongoing/` = in progress. No card = done (deleted after merge). Max 3 ongoing cards at all times.
