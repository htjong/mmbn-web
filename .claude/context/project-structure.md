---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T04:33:14Z
version: 1.1
author: Claude Code PM System
---

# Project Structure

## Root Layout

```
mmbn-web/
├── packages/
│   ├── shared/          # @mmbn/shared — game logic & types
│   ├── client/          # @mmbn/client — browser game
│   └── server/          # @mmbn/server — WebSocket server
├── kanban/              # Task tracking
│   ├── ideas/           # Raw ideas (one-liners)
│   ├── backlog/         # Specced cards ready to pick up
│   ├── ongoing/         # Active work (max 3)
│   ├── PLAN.md          # Roadmap and sprint tracking
│   └── CHANGELOG.md     # Sprint completion history
├── docs/
│   ├── BRANCHING.md     # Git workflow strategy
│   ├── deployment.md    # Deployment guide (GitHub Actions → Droplet → PM2)
│   └── feature-workflow.md
├── .claude/
│   ├── agents/          # Subagent definitions
│   ├── commands/        # Slash command implementations
│   ├── context/         # This directory — persistent session context
│   └── rules/           # Datetime and other rules
├── CLAUDE.md            # AI operating manual (architecture, patterns)
├── README.md            # Human onboarding
├── package.json         # Workspace root (npm workspaces)
└── tsconfig.json        # Root TypeScript config
```

## packages/shared — Core Logic

```
packages/shared/src/
├── battle/
│   ├── BattleEngine.ts      # Pure state machine (tick, applyAction)
│   ├── BattleEngine.test.ts
│   ├── GridSystem.ts        # 6x3 grid operations
│   ├── ChipSystem.ts        # Chip execution & element damage
│   ├── SimpleAI.ts          # AI controller for campaign
│   └── SimpleAI.test.ts
├── types/
│   ├── BattleState.ts       # Complete battle state type
│   ├── Chip.ts              # Chip type definitions
│   ├── GridTypes.ts         # Panel, grid types
│   └── NetworkMessages.ts   # Socket.io message schemas (Zod)
├── data/
│   ├── chips.ts             # All chip definitions
│   └── viruses.ts           # Virus definitions
├── utils/
│   └── validation.ts
└── index.ts                 # Public exports
```

## packages/client — Browser Game

```
packages/client/src/
├── scenes/
│   └── BattleScene.ts       # Main Phaser scene (game loop, input, AI)
├── rendering/
│   ├── GridRenderer.ts      # Renders 6x3 battle grid
│   ├── NaviRenderer.ts      # Renders player/enemy navis
│   └── ChipRenderer.ts      # Renders chip selection UI
├── input/
│   ├── InputHandler.ts      # Keyboard input (keysJustPressed)
│   └── InputHandler.test.ts
├── stores/
│   └── battleStore.ts       # Zustand state for PVP client state
└── main.ts                  # Entry point
```

## packages/server — WebSocket Server

```
packages/server/src/
├── battle/
│   ├── BattleRoom.ts        # Per-match state and lifecycle
│   └── BattleSimulator.ts   # Server-side battle tick loop
├── matchmaking/
│   └── Queue.ts             # FIFO matchmaking queue
├── SocketManager.ts         # Socket.io event routing
└── index.ts                 # Entry point (port 3000)
```

## File Naming Conventions

- **PascalCase** for classes and Phaser scenes: `BattleEngine.ts`, `GridRenderer.ts`
- **camelCase** for utilities and data: `chips.ts`, `validation.ts`
- **kebab-case** for kanban cards: `chip-select-overlay.md`
- Test files co-located with source: `BattleEngine.test.ts` next to `BattleEngine.ts`
- `.js` extensions required on all relative imports in `shared/` only — `server/` is bundled by tsup and does not require them
