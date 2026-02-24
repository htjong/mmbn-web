# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Links
- **[PLAN.md](./kanban/PLAN.md)** - Implementation roadmap and milestones
- **[kanban/](./kanban/)** - Task tracking (ideas → backlog → ongoing)
- **[CHANGELOG.md](./kanban/CHANGELOG.md)** - Sprint completion history
- **[BRANCHING.md](./docs/BRANCHING.md)** - Git workflow and branch strategy
- **[CLAUDE.md](./CLAUDE.md)** - You are here - architecture and patterns guide
- **[docs/feature-workflow.md](./docs/feature-workflow.md)** - Feature design workflow (`/feature:explore` → `/feature:formalize`)
- **[docs/deployment.md](./docs/deployment.md)** - Deployment architecture and operations guide

## Context System

Session context lives in `.claude/context/` (9 focused files covering architecture, battle system, chips, AI, networking, etc.).

**At session start:** Run `/context:prime` to load relevant context into the conversation.
**When wrapping up:** Run `/context:update` or `/handoff` to persist session state.

Slash commands:
- `/context:prime` — Load context files for the current task
- `/context:create` — Initialize context for a new project area
- `/context:update` — Update context after completing work
- `/feature:explore` — Brainstorm feature directions
- `/feature:formalize` — Turn a chosen direction into an implementable spec

Context files: `.claude/context/` | Agent definitions: `.claude/agents/` | Commands: `.claude/commands/`

## Plan Files

Plan mode (via `EnterPlanMode`/`ExitPlanMode`) writes plans to **`~/.claude/plans/`** (global, per-machine). This is managed by Claude Code automatically.

**Never read `.claude/plans/` (local) as an authoritative plan source.** The local directory is a gitignored scratch area cleaned up by `/work:ceremony-closing`. If a file exists there, treat it as a stale artifact — not the current plan.

- ✅ Plans live in: `~/.claude/plans/<name>.md`
- ❌ Do not commit anything under `.claude/plans/`
- ❌ Do not read local `.claude/plans/` files as the current plan for a task

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
- Follow [BRANCHING.md](./docs/BRANCHING.md) strategy religiously
- All daily work goes on the active `sprint/N` branch — never commit directly to `main`
- Feature work gets its own `feature/descriptive-name` branch off `sprint/N`; PM/docs commits go directly on `sprint/N`
- Use conventional commit messages (`feat(scope): description`)
- `main` only receives sprint merge commits (`--no-ff`) tagged `v0.N.0`
- Update kanban cards and kanban/PLAN.md after significant progress

### 4. Documentation Maintenance
- **Follow the Workflow** in [PLAN.md](./kanban/PLAN.md#workflow) — it defines exactly when to update what
- **When finding new patterns:** Document in CLAUDE.md
- **New ideas during work:** Drop a card in `kanban/ideas/`

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
- Create subtasks for complex features or milestones
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
3. **Design Review:** For major architectural changes, see [BRANCHING.md - Tier 3](./docs/BRANCHING.md#tier-3-design-review-for-major-architectural-changes)
4. **Implement:** Write code following established conventions
5. **Test:** Verify TypeScript, tests, manual testing
   - Background validation: spawn `test-runner` agent in background after implementation (non-blocking)
   - Failure diagnosis: spawn `test-runner` foreground when tests fail for root-cause analysis and prioritized fixes
6. **Code Review:** Before committing, perform review per [BRANCHING.md - Code Review Process](./docs/BRANCHING.md#code-review-process)
   - Tier 1: Automated checks (`npm run type-check && npm run test && npm run lint`)
   - Tier 2: Architecture checkpoints (imports, types, purity, patterns)
   - Tier 3: Design review (if not done in step 3)
7. **Commit:** Use conventional commits with clear messages
8. **Document:** Update kanban cards, kanban/CHANGELOG.md, and kanban/PLAN.md as needed — changelog sprint headers must include date **and time** (e.g. `2026-02-18 20:18 PST`)
9. **Summarize:** Explain what was accomplished after tasks

### Red Flags I Watch For

❌ Committing directly to main (all work goes to `sprint/N` first)
❌ Skipping tests
❌ Breaking TypeScript compilation
❌ Long-lived `feature/*` or `fix/*` branches (>3 days) — `sprint/*` branches are the exception
❌ Vague commit messages
❌ Mixing multiple features in one branch
❌ Not updating kanban/CHANGELOG.md / kanban/PLAN.md after significant work
❌ Creating new patterns without documenting them
❌ Staging or committing `.claude/plans/` files (plan files are ephemeral — `~/.claude/plans/` only)
❌ Reading a local `.claude/plans/` file as the current plan (stale artifact — delete it)

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

Follow the [BRANCHING.md](./docs/BRANCHING.md) strategy:
- Start each sprint: `git checkout -b sprint/N main`
- Feature work: `git checkout -b feature/descriptive-name sprint/N`
- Commit with conventional messages: `feat(scope): description`
- Merge features back to sprint branch; close sprint by merging sprint → main with `--no-ff`

**Branch types:**
- `sprint/*` - Integration branch for one sprint (1–7 days); all daily work lands here
- `feature/*` - Individual features branched off `sprint/N`, merged back to `sprint/N`
- `fix/*` - Bug fixes branched off `sprint/N`
- `experiment/*` - Exploratory work branched off `sprint/N`
- `hotfix/*` - Critical fixes to `main` directly (cherry-pick back to sprint branch after)

Milestones are planning concepts tracked in `kanban/PLAN.md`, not git branches. `sprint/*` is the primary integration unit; `feature/*` branches are short-lived work units within a sprint.

## Development Commands

### Run Everything
```bash
npm run dev              # Starts both client (port 5173) and server (port 3000)
```

### Run Individual Packages
```bash
npm run dev --workspace=packages/client   # Client only (Vite dev server)
npm run dev --workspace=packages/server   # Server only (tsx watch)
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
A basic attack matching MMBN3's MegaBuster:
- **Always available** — No custom gauge cost, always usable
- **Base damage** — 1 HP per hit (matches MMBN3 base buster)
- **Same-row only** — Fires horizontally, must be on same row as opponent to hit
- **No cooldown** — Can be used any time
- **Fallback** — Provides a weak attack when player has no chips

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

Chips defined in `packages/shared/src/data/chips.ts` as plain objects matching MMBN3:
```typescript
{
  id: string,
  name: string,
  element: 'none' | 'fire' | 'aqua' | 'elec' | 'wood',
  damage: number,
  effects: ChipEffect[],
  description: string
}
```

- **Elements** follow MMBN3 cycle: Fire→Wood→Elec→Aqua→Fire (2x advantage, 0.5x disadvantage)
- **No rarity system** — MMBN3 uses chip codes (A-Z, *) instead (deferred)
- **No accuracy** — Chips hit based on positioning, not RNG
- **Up to 5 chips** selectable per custom screen (matches MMBN3)
- **Same-row targeting** — Buster and chips fire horizontally

Element effectiveness calculated in `ChipSystem.getElementEffectiveness(source, target)`

### SimpleAI (packages/shared/src/battle/SimpleAI.ts)

AI controller for single-player campaign battles. Called once per frame from `BattleScene`.

```typescript
const ai = new SimpleAI();
const action = ai.getNextAction(aiPlayerId, state); // PlayerAction | null
```

**Design:**
- **Dual cooldowns** — `moveCooldown` (20 frames/~0.33s) and `attackCooldown` (40 frames/~0.67s) are independent, so AI can move and attack without one blocking the other
- **Row-aware movement** — When not on opponent's row, 70% chance to move toward opponent's Y; when aligned, random dodge movement
- **Multi-chip selection** — Selects up to 3 chips per gauge cycle with no cooldown between selects, then uses them on attack cooldown
- **Smart buster** — Only fires when on same row as opponent (no wasted attacks)

**Priority order:** chip_select (gauge full) → chip_use (has chips) → buster (same row) → movement

**Note:** Uses `Math.random()` — determinism is not required for AI decisions. The AI is a client-side concern; server-authoritative mode would use server-side AI.

### Client Rendering (packages/client/)

- **Phaser scenes:** `src/scenes/BattleScene.ts` - main battle rendering
- **Renderers:** `src/rendering/` - GridRenderer, NaviRenderer, ChipRenderer
- **State management:** Zustand store in `src/stores/battleStore.ts`
- **React UI:** `src/ui/` - menus, HUD, chip selection overlays

Phaser handles game grid/sprites, React handles UI overlays.

### React UI Architecture — Atomic Design + Dumb Components

The React UI follows **selective atomic design** with dumb presentational components. This is the established pattern for all new UI work.

#### The Rule

| Level | Hook pairing required? | Rationale |
|-------|----------------------|-----------|
| **Atoms** (HpBar, GaugeBar, ChipCard, ChipSlot, GameOverOverlay) | **No** — unless complex | Already props-only; adding a hook file is noise |
| **Molecules** (HudRow, ChipSelectPanel) | **No** — unless reused in 2+ contexts | Controlled components; receive all data as props |
| **Organisms** (BattleHud) | **Yes — always** | Organisms are the boundary between store and UI |

Pair a component with a hook when: (a) it reads from the Zustand store, or (b) it needs a `useEffect` that depends on external state, or (c) it's reused in 2+ different data contexts.

#### What "Dumb Component" Means

- Receives all data via props — no `useBattleStore()` calls
- May have `useState` for purely cosmetic local state (hover, tooltip open)
- May have `useEffect` if the effect is **lifecycle-scoped** (attach/detach listener while mounted) and fires a **callback prop** — this is still considered dumb because behavior is controlled externally
- Never derives data from the store directly

#### Pattern: Organism + Paired Hook

```
BattleHud.tsx          ← dumb composition layer; no store access
useBattleHud.ts        ← single hook; owns all store reads + keyboard effects
```

The hook returns a flat object. The organism destructures it and passes props down:

```typescript
// useBattleHud.ts — reads store, owns effects, returns typed props object
export function useBattleHud() {
  const store = useBattleStore();
  useEffect(() => { /* keyboard handling */ }, [store.customScreenOpen]);
  return { player1, player2, gaugeValue, gaugeMax, customScreenOpen, ... };
}

// BattleHud.tsx — no store import, no useEffect, pure composition
export function BattleHud() {
  const { player1, gaugeValue, ... } = useBattleHud();
  return <div><HudRow ... /><GaugeBar value={gaugeValue} ... /></div>;
}
```

#### Stale Closure Pattern

Inside `useEffect` handlers that fire store actions, always read fresh state from `useBattleStore.getState()` rather than capturing reactive values in the closure:

```typescript
// ❌ Stale closure — chipCursorIndex is captured at effect creation time
useEffect(() => {
  const handler = () => store.toggleChip(store.chipCursorIndex);
  ...
}, [store.customScreenOpen, store.chipCursorIndex]); // re-runs on every cursor move

// ✓ Fresh read — always gets current index at event fire time
useEffect(() => {
  const handler = () => {
    const { chipCursorIndex, toggleChip } = useBattleStore.getState();
    toggleChip(chipCursorIndex);
  };
  ...
}, [customScreenOpen]); // only re-runs when screen opens/closes
```

#### Storybook

All presentational components have Storybook stories colocated alongside them:

```
src/ui/atoms/HpBar.tsx              ← component
src/ui/atoms/HpBar.stories.tsx      ← stories
```

Run Storybook: `npm run storybook --workspace=packages/client` (port 6006)

Shared mock data for stories: `src/ui/storybookMocks.ts`

When adding a new presentational component, **always add a story file** covering the key prop variants.

## Key Files

- `packages/shared/src/battle/BattleEngine.ts` - Core battle logic
- `packages/shared/src/battle/GridSystem.ts` - 6-column x 3-row grid operations
- `packages/shared/src/battle/ChipSystem.ts` - Chip execution & damage
- `packages/shared/src/battle/SimpleAI.ts` - AI controller for campaign battles
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
3. **Modify server code** → tsx watch auto-restart

All three watch simultaneously with `npm run dev`

## Adding New Features
For game data, the following references can be checked first. 
- https://www.therockmanexezone.com/wiki/Mega_Man_Battle_Network_3
- https://www.mmhp.net/GameHints/MMBN3-Data.html 

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

## ESM Import Rules

**Relative imports in `packages/shared/` MUST use `.js` extensions:**

```typescript
// Correct (packages/shared/)
import { Chip } from '../types/Chip.js';

// Wrong — will fail at runtime
import { Chip } from '../types/Chip';
```

**Why:** `packages/shared/` is built with `tsc` and its output is run directly by Node.js. Node ESM requires explicit `.js` extensions. TypeScript understands `.js` extensions pointing to `.ts` files.

**`packages/server/` does NOT need `.js` extensions** — it is built with `tsup` (esbuild), which bundles all server-internal imports and handles module resolution automatically.

**`packages/client/` does NOT need `.js` extensions** — Vite bundles everything and handles resolution internally.

## Server Build Output

The server is built with **tsup** (esbuild wrapper), which produces a single bundled file at `packages/server/dist/index.js`. The `@mmbn/shared` package is inlined into this bundle (`noExternal: [/@mmbn/]`), so no workspace symlinks are required on the Droplet at runtime.

The `start` script and PM2 commands reference `packages/server/dist/index.js`.

Dev mode (`npm run dev`) still uses `tsx watch` directly against the source — tsup is only used for production builds.
