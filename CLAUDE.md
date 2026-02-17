# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Links
- **[PLAN.md](./PLAN.md)** - Implementation roadmap and current progress
- **[BRANCHING.md](./BRANCHING.md)** - Git workflow and branch strategy
- **[CLAUDE.md](./CLAUDE.md)** - You are here - architecture and patterns guide

## Project Overview

A Mega Man Battle Network 3-inspired web game with two modes:
- **Campaign Mode:** Offline single-player against viruses
- **PVP Mode:** Real-time 1v1 matchmaking over WebSockets

Built with TypeScript, targeting web browsers with 2D pixel art style.

## Monorepo Architecture

This is an npm workspaces monorepo with three packages:

```
packages/
├── shared/   # Game logic & types (runs on both client and server)
├── client/   # Browser game (Vite + Phaser 3 + React)
└── server/   # WebSocket server (Node.js + Socket.io)
```

**Critical Design Principle:** The battle system in `packages/shared` is **deterministic** and runs identically on both client and server. This enables:
- Client-side prediction (responsive gameplay, no input lag)
- Server-authoritative validation (prevents cheating)
- Campaign mode (purely client-side using same battle logic)

Import shared code in client/server using: `import { ... } from '@mmbn/shared'`

## Git Workflow

Follow the [BRANCHING.md](./BRANCHING.md) strategy:
- Create feature branches: `git checkout -b feature/phase-name main`
- Commit with conventional messages: `feat(scope): description`
- Push and create PRs: `git push origin feature/...`
- Merge to main when complete

**Branch types:**
- `phase/*` - Main development for each phase
- `feature/*` - Individual features within a phase
- `fix/*` - Bug fixes
- `experiment/*` - Exploratory work
- `hotfix/*` - Critical fixes to main

## Development Commands

### Run Everything
```bash
npm run dev              # Starts both client (port 5173) and server (port 3000)
```

### Run Individual Packages
```bash
npm run dev --workspace=packages/client   # Client only (Vite dev server)
npm run dev --workspace=packages/server   # Server only (ts-node-dev)
npm run dev --workspace=packages/shared   # Shared in watch mode (tsc --watch)
```

### Testing
```bash
npm run test             # All tests
npm run test:shared      # Shared package tests (critical - battle logic)
npm run test:client      # Client tests
npm run test:server      # Server tests
```

To run a single test file:
```bash
cd packages/shared && npx vitest run src/battle/BattleEngine.test.ts
```

### Type Checking & Linting
```bash
npm run type-check       # TypeScript compilation check (all packages)
npm run lint             # ESLint check
```

### Building
```bash
npm run build            # Build all packages
```

## Core Architecture Patterns

### Battle System (packages/shared/src/battle/)

The `BattleEngine` is a pure state machine:
```typescript
BattleEngine.createInitialState(player1Id, player2Id, folder) → BattleState
BattleEngine.tick(state) → { state: BattleState, events: BattleEvent[] }
BattleEngine.applyAction(state, playerId, action) → { state: BattleState, events: BattleEvent[] }
```

- **Input:** Current state + action
- **Output:** New state + events (side-effect free)
- **Determinism:** Same inputs always produce same outputs
- **JSON serialization:** State is plain objects (no classes with methods)

### Grid System

6x3 grid (6 rows, 3 columns):
- Player 1 starts on left column (x=0)
- Player 2 starts on right column (x=2)
- Middle column (x=1) is neutral territory
- Panel states: `normal | cracked | broken | locked`
- Panel ownership: `player1 | player2 | neutral`

Access: `grid[y][x]` (row-major order)

### Network Protocol (Socket.io events)

**Client → Server:**
- `queue:join` - Join matchmaking queue
- `battle:input` - Send player action (chip select, move, etc.)

**Server → Client:**
- `match:found` - Matched with opponent
- `battle:start` - Battle initialized
- `battle:update` - State sync (60 Hz)
- `battle:end` - Battle concluded

All messages validated with Zod schemas in `packages/shared/src/types/NetworkMessages.ts`

### Chip System

Chips defined in `packages/shared/src/data/chips.ts` as plain objects:
```typescript
{
  id: string,
  name: string,
  element: 'normal' | 'fire' | 'aqua' | 'elec' | 'wood' | 'wind' | 'break' | 'cursor',
  damage: number,
  effects: ChipEffect[]
}
```

Element effectiveness calculated in `ChipSystem.getElementEffectiveness(source, target)`

### Client Rendering (packages/client/)

- **Phaser scenes:** `src/scenes/BattleScene.ts` - main battle rendering
- **Renderers:** `src/rendering/` - GridRenderer, NaviRenderer, ChipRenderer
- **State management:** Zustand store in `src/stores/battleStore.ts`
- **React UI:** `src/ui/` - menus, HUD, chip selection overlays

Phaser handles game grid/sprites, React handles UI overlays.

## Key Files

- `packages/shared/src/battle/BattleEngine.ts` - Core battle logic
- `packages/shared/src/battle/GridSystem.ts` - 6x3 grid operations
- `packages/shared/src/battle/ChipSystem.ts` - Chip execution & damage
- `packages/shared/src/types/BattleState.ts` - Complete battle state type
- `packages/shared/src/data/chips.ts` - All chip definitions
- `packages/client/src/scenes/BattleScene.ts` - Main Phaser scene
- `packages/server/src/index.ts` - WebSocket server entry point

## Testing Strategy

**Shared package tests are critical** - they verify battle logic is deterministic and correct. Always run `npm run test:shared` after modifying battle systems.

Test structure:
```typescript
import { describe, it, expect } from 'vitest';
import { BattleEngine } from './BattleEngine';

describe('BattleEngine', () => {
  it('should create initial battle state', () => {
    const state = BattleEngine.createInitialState(...);
    expect(state.frame).toBe(0);
  });
});
```

## Development Workflow

1. **Modify shared logic** → shared package auto-rebuilds → client/server hot-reload
2. **Modify client code** → Vite HMR (instant)
3. **Modify server code** → ts-node-dev auto-restart

All three watch simultaneously with `npm run dev`

## Adding New Features

### Adding a new chip:
1. Add definition to `packages/shared/src/data/chips.ts`
2. Implement effect logic in `packages/shared/src/battle/ChipSystem.ts`
3. Add rendering in `packages/client/src/rendering/ChipRenderer.ts`
4. Add tests in `packages/shared/src/battle/ChipSystem.test.ts`

### Adding new battle mechanics:
1. Update `BattleState` type in `packages/shared/src/types/BattleState.ts`
2. Implement logic in `BattleEngine.ts` (ensure deterministic)
3. Add unit tests (verify same input = same output)
4. Update client rendering to display new mechanic
5. Update server validation if needed

## TypeScript Path Aliases

```typescript
import { BattleEngine } from '@mmbn/shared';  // From any package
import { ... } from '@shared/...';             // Within client
import { ... } from '@client/...';             // Within client
```

Configured in `tsconfig.json` and `vite.config.ts`
