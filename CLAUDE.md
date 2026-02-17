# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Links
- **[PLAN.md](./PLAN.md)** - Implementation roadmap and current progress
- **[BRANCHING.md](./BRANCHING.md)** - Git workflow and branch strategy
- **[CLAUDE.md](./CLAUDE.md)** - You are here - architecture and patterns guide

## Claude's Role

As Claude Code working on this project, I ensure these responsibilities:

### 1. Architectural Consistency
- Maintain the deterministic battle engine pattern
- Keep shared logic pure (no side effects)
- Follow monorepo conventions (proper imports, no cross-contamination)
- Respect the separation: shared = logic, client = rendering, server = validation

### 2. Code Quality Standards
- All code must pass TypeScript compilation (`npm run type-check`)
- All tests must pass before committing
- Follow established patterns (see existing implementations)
- No unused variables or parameters
- Proper error handling at system boundaries

### 3. Git Workflow Adherence
- Follow [BRANCHING.md](./BRANCHING.md) strategy religiously
- Create feature branches for all work (`feature/phase-name`)
- Use conventional commit messages (`feat(scope): description`)
- Never commit directly to main
- Update PLAN.md after significant progress

### 4. Documentation Maintenance
- **After completing work:** Update PLAN.md with:
  - Phase status (✅/🔄/🔲)
  - Files completed
  - Current blockers
  - Next priority actions
- **When finding new patterns:** Document in CLAUDE.md
- **After each phase:** Commit with clear summary

### 5. Testing Discipline
- Write tests for shared/battle logic (deterministic = testable)
- Verify tests pass before merging: `npm run test:shared`
- Test manually in browser for client changes
- Never skip testing "because it's small"

### 6. Communication Standards
- Provide clear explanations of changes
- Show file paths when referencing code
- Summarize what was accomplished after tasks
- Ask for clarification when requirements are ambiguous

### 7. Progress Tracking
- Mark tasks in progress when starting: `TaskUpdate #4 in_progress`
- Mark tasks complete when done: `TaskUpdate #4 completed`
- Create subtasks for complex phases
- Keep task list clean and up-to-date

### 8. Problem-Solving Approach
- Read existing code before proposing changes
- Reuse existing utilities and patterns
- Fix root causes, not symptoms
- Consider performance and scalability
- Think about edge cases

### How I Work Through Tasks

1. **Understand:** Read relevant files, understand existing patterns
2. **Plan:** For non-trivial tasks, use plan mode to design approach
3. **Design Review:** For major architectural changes, see [BRANCHING.md - Tier 3](./BRANCHING.md#tier-3-design-review-for-major-architectural-changes)
4. **Implement:** Write code following established conventions
5. **Test:** Verify TypeScript, tests, manual testing
6. **Code Review:** Before committing, perform review per [BRANCHING.md - Code Review Process](./BRANCHING.md#code-review-process)
   - Tier 1: Automated checks (`npm run type-check && npm run test && npm run lint`)
   - Tier 2: Architecture checkpoints (imports, types, purity, patterns)
   - Tier 3: Design review (if not done in step 3)
7. **Commit:** Use conventional commits with clear messages
8. **Document:** Update PLAN.md with progress
9. **Summarize:** Explain what was accomplished after tasks

### Red Flags I Watch For

❌ Committing directly to main
❌ Skipping tests
❌ Breaking TypeScript compilation
❌ Long-lived branches (>3 days)
❌ Vague commit messages
❌ Mixing multiple features in one branch
❌ Not updating PLAN.md after significant work
❌ Creating new patterns without documenting them

### My Commitment

I ensure that every interaction:
- Moves the project forward toward completion
- Maintains code quality and architecture integrity
- Keeps documentation up-to-date
- Follows the established workflow
- Leaves the codebase better than I found it

## Project Overview

A Mega Man Battle Network 3-inspired web game with two modes:
- **Campaign Mode:** Offline single-player against viruses
- **PVP Mode:** Real-time 1v1 matchmaking over WebSockets

Built with TypeScript, targeting web browsers with 2D pixel art style.

## Input Controls

**Keyboard Mapping (WASD + Special Keys):**
- **W** - Move navi up
- **A** - Move navi left
- **S** - Move navi down
- **D** - Move navi right
- **Spacebar** - Open Custom bar (chip selection screen)
- **K** - Activate selected chip
- **J** - Use buster attack (basic attack, always available)

**Input Behavior:**
- All keys use "press-to-act" — each press produces exactly one action
- Holding a key does NOT repeat the action; must release and press again
- Implemented via `keysJustPressed` tracking in InputHandler

**Movement Rules:**
- Adjacent moves only (Manhattan distance = 1)
- Players can only move onto panels they own:
  - Player 1: columns 0-2
  - Player 2: columns 3-5
- Cannot cross into opponent territory
- Validated in `BattleEngine.applyAction()` by checking `grid[y][x].owner`

**Note:** Keep these consistent across all input implementations (client scenes, tests, documentation).

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

#### Buster Mechanic
A basic attack system independent of chips:
- **Always available** - No custom gauge cost, always usable
- **Fixed damage** - 10 HP per hit
- **No cooldown** - Can be used any time
- **Fallback** - Provides a move when player has no chips
- **Learning tool** - Helps new players learn the game without chip complexity

#### Real-Time Battle Model
The battle system is **real-time**, not turn-based. Both players act simultaneously:
- Both players' custom gauges fill every frame (independently)
- Movement, buster, and chip actions are available at any time
- No turn phases or turn switching — all actions are processed as they arrive
- Game loop: increment frame → fill both gauges → check game over

Implement in `BattleEngine.applyAction()` as action type `'buster'`.

### Grid System

6x3 grid (6 columns, 3 rows) — horizontal layout:
```
OOOXXX
O1OX2X
OOOXXX
```
- **O** = Player 1 panels (columns 0-2)
- **X** = Player 2 panels (columns 3-5)
- Player 1 starts at position (1, 1)
- Player 2 starts at position (4, 1)
- Panel states: `normal | cracked | broken | locked`
- Panel ownership: `player1 | player2`
- Bounds: x=[0,5], y=[0,2]

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
- `packages/shared/src/battle/GridSystem.ts` - 6-column x 3-row grid operations
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
