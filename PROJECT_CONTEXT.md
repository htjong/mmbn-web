# Current Goal

Complete Phase 3 (Basic Client Rendering) and move to Phase 4 (Server Infrastructure). Phase 3 is nearly done — game loop is wired up, but client InputHandler tests are failing and local browser testing hasn't been verified yet.

# Architecture

- **Monorepo**: `packages/shared` (deterministic battle logic), `packages/client` (Phaser 3 + React), `packages/server` (Node.js + Socket.io)
- **Battle Engine**: Pure state machine in shared — `createInitialState()`, `tick()`, `applyAction()` — runs identically on client and server
- **Grid**: 6x3 (6 columns, 3 rows), `grid[y][x]`, P1 owns cols 0-2, P2 owns cols 3-5
- **Input**: WASD movement, J buster, K chip, Space custom bar — press-to-act (no hold repeat)
- **Server**: Socket.io with matchmaking queue, battle rooms, and authoritative simulation (basic structure committed but Phase 4 not fully implemented)

# Decisions Made

- Real-time simultaneous gameplay (not turn-based) — both players act independently, no turn phases
- Deterministic shared engine enables client-side prediction + server authority
- Buster mechanic as always-available fallback attack (10 HP damage, no cooldown)
- Press-to-act input (keysJustPressed) instead of hold-to-repeat for precise control
- Panel ownership restricts movement — players cannot cross into opponent territory
- 6x3 horizontal grid layout (was originally vertical 3x6, corrected early)

# What Changed Recently

- **Server infrastructure scaffolded** (commit `7d8f805`): Added `SocketManager.ts`, `matchmaking/Queue.ts`, `battle/BattleRoom.ts`, `battle/BattleSimulator.ts`
- **Battle system refactored to real-time** (commit `fd22031`): Replaced turn-based with simultaneous gameplay
- **Grid layout fixed** (commit `0907a00`): Corrected from 3x6 vertical to 6x3 horizontal
- **Input system created** with full test coverage (8 tests for InputHandler)
- **BattleScene fully integrated**: InputHandler + BattleEngine wired into Phaser update loop
- **CLAUDE.md updated**: Added PROJECT_CONTEXT.md handoff system (uncommitted)

# Known Issues / Open Questions

- **Client InputHandler tests failing** (9/9 fail): Constructor error — `Cannot read properties of undefined (reading 'destroy')`. The `handler` variable is undefined in tests, likely a beforeEach initialization issue. Shared tests pass fine (9/9).
- **Browser testing not yet done**: Game loop is wired up but hasn't been verified visually in browser
- **Server Phase 4 status unclear**: Files exist from commit `7d8f805` but PLAN.md still marks Phase 4 as PENDING — need to verify actual completion level
- **No AI opponent yet**: Can't easily test battle without second player or simple AI

# Next Steps

1. Fix InputHandler test failures (likely constructor/mock issue)
2. Test Phase 3 locally in browser — run `npm run dev`, open localhost:5173, verify rendering and controls
3. Assess Phase 4 server completion — read server files to determine what's done vs. still needed
4. Add simple AI or second-player controls for local testing without network
5. Update PLAN.md to reflect actual server file status

# How to Resume

```bash
# Check current state
npm run type-check          # Should pass (verified)
npm run test:shared         # Should pass (9/9)
npm run test                # InputHandler tests currently FAILING

# Start dev server for browser testing
npm run dev                 # Client on :5173, Server on :3000

# Key files to review
packages/client/src/input/InputHandler.test.ts    # Failing tests — fix first
packages/server/src/                               # Assess Phase 4 completion
PLAN.md                                            # Update after assessment
```
