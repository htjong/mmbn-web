---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T02:35:20Z
version: 1.0
author: Claude Code PM System
---

# Project Overview

## Summary

`mmbn-web` is a TypeScript monorepo (npm workspaces) implementing a Mega Man Battle Network 3-style browser game. The battle engine runs identically on client and server — enabling client-side prediction and server-authoritative validation from the same code.

## Current Feature State

### Implemented

- **BattleEngine** — Pure state machine with `tick()` and `applyAction()`. Handles movement, buster, chip_select, chip_use actions.
- **GridSystem** — 6x3 grid with panel ownership, panel states (normal/cracked/broken/locked), and move validation.
- **ChipSystem** — Chip execution, element effectiveness (Fire→Wood→Elec→Aqua cycle), damage calculation.
- **SimpleAI** — Campaign AI with dual cooldowns, row-aware movement, multi-chip selection, smart buster.
- **BattleScene** — Phaser 3 scene wiring game loop, player input, AI, and renderers.
- **Renderers** — `GridRenderer`, `NaviRenderer`, `ChipRenderer` (Phaser-based).
- **InputHandler** — Keyboard input with `keysJustPressed` (press-once-per-press semantics).
- **Server skeleton** — `SocketManager`, `BattleRoom`, `BattleSimulator`, `Queue` — infrastructure exists but not yet connected end-to-end for PVP.
- **Network messages** — Zod-validated Socket.io message schemas.
- **Chip data** — Initial chip definitions in `chips.ts`.
- **Virus data** — Initial virus definitions in `viruses.ts`.

### Not Yet Implemented

- Chip select overlay UI (backlog card exists)
- Win/loss screen
- PVP matchmaking end-to-end (server exists, client not connected)
- Campaign progression (mission select, chip drops, save system)
- Pixel art sprites (placeholder rectangles currently)
- Audio
- React HUD / UI polish

## Integration Points

| Integration | Status |
|-------------|--------|
| Phaser ↔ BattleEngine | Wired — BattleScene calls tick() and applyAction() |
| BattleScene ↔ SimpleAI | Wired — AI runs each frame in BattleScene |
| Client ↔ Socket.io server | Partial — server infrastructure exists, client not yet connected |
| Zustand store ↔ PVP | Not yet — store exists but PVP flow not wired |
| React UI ↔ Phaser | Partial — chip select overlay pending |

## Test Coverage

| File | Tests |
|------|-------|
| `BattleEngine.test.ts` | Core engine (state creation, tick, actions, damage) |
| `SimpleAI.test.ts` | AI action validity and behavior |
| `InputHandler.test.ts` | Press-once semantics |
