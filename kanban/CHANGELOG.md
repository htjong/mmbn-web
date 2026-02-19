# Changelog

All notable project progress is documented here, organized by sprint.

---

## Sprint 4: Infrastructure & Context System
**Date:** 2026-02-18

- Replaced `PROJECT_CONTEXT.md` with distributed `.claude/context/` system (9 focused context files)
- Added `README.md` for human onboarding
- Migrated slash commands to colon-based syntax (`/feature:explore`, `/feature:formalize`)
- Added context management commands (`/context:create`, `/context:prime`, `/context:update`)
- Added custom agent definitions in `.claude/agents/` (`analyze-code`, `analyze-file`)
- Updated `CLAUDE.md` with new Context System section
- Updated `docs/feature-workflow.md` with new command syntax
- Added `.archive` to `.gitignore`

---

## Sprint 3: Battle Mechanics & MMBN3 Accuracy
**Date:** 2026-02-18

- `chip_use` action in BattleEngine — chips deal damage, consumed after use
- `chip_selected` event type — distinguishes selection from usage
- Same-row targeting — buster and chips only hit when on same row as opponent
- SimpleAI — priority-based AI with dual cooldowns and row-aware movement:
  - Separate move (20f) and attack (40f) cooldowns
  - Row-aware movement: 70% bias toward opponent's row
  - Selects up to 3 chips per gauge cycle
  - Only fires buster when on same row as opponent
- MMBN3 accuracy pass — fixed all values to match original game:
  - Starting HP: 200 → 100, Buster damage: 10 → 1, Chip select limit: 3 → 5
  - Removed wind/break/cursor elements, accuracy, customCost, rarity fields
  - Fixed chip data: Cannon/HiCannon/M-Cannon/Sword/ShockWave/AreaGrab
  - Fixed virus HP: Mettaur 40, Bunny 40, Canodumb 60
  - Element system: MMBN3 cycle (Fire→Wood→Elec→Aqua→Fire, 2x/0.5x)
- 32 unit tests passing (14 BattleEngine, 9 SimpleAI, 9 InputHandler)

## Sprint 2: Server & Deployment Infrastructure
**Date:** 2026-02-17

- Server matchmaking with Socket.io (queue join, match found, battle rooms)
- Server-authoritative battle simulation (state sync at 60 Hz)
- DigitalOcean Droplet deployment with GitHub Actions CI/CD
- ESM import fixes (`.js` extensions for Node production)
- Dev/prod parity steps
- Git branching strategy, code review process, PROJECT_CONTEXT.md handoff system

**Key decisions:**
- Single $6/mo DigitalOcean Droplet (nginx + Node.js + PM2)
- Build in GitHub Actions (7GB RAM), not on Droplet (512MB)
- rsync built artifacts instead of git pull + build on server
- Same-origin deployment eliminates CORS complexity

## Sprint 1: Battle Engine & Client Rendering
**Date:** 2026-02-16

- `BattleEngine` — deterministic state machine (pure function: state + action → new state + events)
- `GridSystem` — 6x3 grid with panel ownership (P1: cols 0-2, P2: cols 3-5)
- `ChipSystem` — chip execution and damage calculations
- `BattleState` type — complete battle state definition
- `NetworkMessages` — Zod-validated message schemas
- 5 core chips defined (Cannon, Sword, etc.), 3 viruses defined
- Real-time simultaneous gameplay (replaced turn-based system)
- `BattleScene`, `GridRenderer`, `NaviRenderer`, `ChipRenderer`
- `InputHandler` — keyboard input (WASD movement, J buster, K chips, Space custom)
- Press-to-act input, panel ownership movement restriction
- HUD displaying HP, frame count, custom gauge, game over state
- 17 unit tests passing (9 BattleEngine, 8 InputHandler)

**Key decisions:**
- 6x3 horizontal grid (not 3x6 vertical)
- Press-to-act input (not hold-to-repeat)
- Buster as always-available basic attack
- Real-time simultaneous model (not turn-based)

## Sprint 0: Project Scaffolding
**Date:** 2026-02-15

- Monorepo setup with npm workspaces (`packages/shared`, `packages/client`, `packages/server`)
- TypeScript configuration with `@mmbn/*` path aliases
- Vite + Phaser 3 + React client stack
- Node.js + Socket.io server skeleton
- ESLint + Prettier + Vitest tooling
- Dev scripts (`npm run dev`, `npm run test`, `npm run type-check`)
