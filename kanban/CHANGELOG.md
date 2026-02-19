# Changelog

All notable project progress is documented here, organized by sprint.

---

## Sprint 6: React UI, Tooling, and Engine Determinism
**Date:** 2026-02-19 07:12 PST

- Replaced Phaser text HUD with React overlay using Zustand store so UI is
  composable and decoupled from the Phaser game loop
- Built atomic UI library (HpBar, GaugeBar, ChipCard, ChipSlot, GameOverOverlay,
  HudRow, ChipSelectPanel) following atomic design — all presentational, all with
  Storybook stories
- Added Storybook to packages/client for isolated component development
- Wired ESLint + Prettier integration (eslint-config-prettier), husky pre-commit
  hook, and lint-staged to enforce consistent formatting on every commit
- Added test-runner agent and wired it into ceremony-closing's failure path for
  deep test diagnosis when the ceremony is blocked
- Fixed BattleEngine determinism violations: moved Math.random() (chip drawing)
  and Date.now() (battle ID) out of the engine — callers now supply pre-drawn
  hands and a stable battleId
- Fixed InputHandler.destroy() to properly remove window event listeners
- Added test assertions for HAND_SIZE and maxCustomGauge constants; added
  deterministic ID test (32 → 33 total tests passing)

**Key decisions:**
- Atomic design pattern: Atoms/Molecules are pure props-only; Organisms read
  from the Zustand store via a paired hook (useBattleHud)
- Stale closure fix: useEffect handlers read fresh store state via
  useBattleStore.getState() rather than capturing reactive values in closures
- BattleEngine determinism restored: randomness is a caller concern, not an
  engine concern — critical for future server-authoritative PVP validation

---

## Sprint 5: Server Build Toolchain & Deployment Docs
**Date:** 2026-02-18 20:18 PST

- Replaced `tsc` with `tsup` (esbuild) for server production build — output now at `packages/server/dist/index.js` (single bundle, `@mmbn/shared` inlined)
- Replaced `ts-node-dev` with `tsx watch` for server dev mode — native ESM TypeScript, no flags needed
- Removed `.js` extensions from server-internal relative imports (tsup handles resolution)
- Simplified `packages/server/tsconfig.json` — type-checking only, tsup owns emit
- Updated all hardcoded dist paths (`dist/server/src/index.js` → `dist/index.js`) in `deploy.yml`, `setup-droplet.sh`, and root `package.json`
- Fixed `vitest` → `vitest run` in shared/client test scripts (was hanging in watch mode)
- Fixed `BattleEngine.test.ts`: HP clamping assertion (`Math.max(0, initialHp - damage)`)
- Added `docs/deployment.md` — full deployment guide (architecture diagram, PM2 ops, env vars, verification steps)
- Updated `CLAUDE.md` — Server Build Output section, ESM Import Rules, dev workflow references
- Updated `README.md` — added Deployment section with quick ops commands

- Documented changelog date+time convention in `kanban/PLAN.md` (Ship workflow step 3) and `CLAUDE.md` (workflow step 8)

**Key decisions:**
- `tsup` with `noExternal: [/@mmbn/]` bundles shared inline — no workspace symlinks needed on Droplet
- `tsx` chosen over `ts-node-dev --esm` for cleaner ESM support in dev
- Build stays in GitHub Actions (7GB RAM); Droplet only runs `npm ci --omit=dev`
- Changelog sprint headers must include date **and time** (e.g. `2026-02-18 20:18 PST`)

---

## Sprint 4: Infrastructure & Context System
**Date:** 2026-02-18 18:51 PST

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
**Date:** 2026-02-18 07:50 PST

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
**Date:** 2026-02-17 14:43 PST

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
**Date:** 2026-02-17 08:54 PST

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
**Date:** 2026-02-16 22:09 PST

- Monorepo setup with npm workspaces (`packages/shared`, `packages/client`, `packages/server`)
- TypeScript configuration with `@mmbn/*` path aliases
- Vite + Phaser 3 + React client stack
- Node.js + Socket.io server skeleton
- ESLint + Prettier + Vitest tooling
- Dev scripts (`npm run dev`, `npm run test`, `npm run type-check`)
