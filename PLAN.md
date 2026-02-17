# PLAN.md — MMBN Web Game

> **Status:** Living document — updated as development progresses
> **Last Updated:** 2026-02-17
> **Methodology:** Agile/iterative — First Playable → iterate → MVP

---

## Project Methodology

This project follows an **agile, iterative approach** with two key milestones:

### First Playable (Current Target)
The **First Playable** is the earliest state where the core gameplay loop works end-to-end in the browser. It's not feature-complete or polished — it's the foundation we iterate on. Once reached, we can playtest, gather feedback, and make informed decisions about what to build next.

**First Playable = a complete single-player battle against AI in the browser.**

### MVP (Minimum Viable Product)
The **MVP** is the full shippable product — all major features implemented, tested, and polished enough for real users. It includes PVP multiplayer, campaign mode, content, and UI polish.

**MVP = all Product Backlog milestones complete.**

### How We Work
- Work is organized into **sprints** (short focused bursts of implementation)
- Features are tracked in the **Product Backlog** as milestones
- Each milestone has **acceptance criteria** defining "done"
- We ship incrementally: First Playable → iterate → MVP

---

## Current Sprint: First Playable

**Status:** IN PROGRESS
**Goal:** Playable single-player battle against AI in the browser

### Completed (Retroactive)

#### Sprint 0: Project Scaffolding
- Monorepo setup with npm workspaces (`packages/shared`, `packages/client`, `packages/server`)
- TypeScript configuration with `@mmbn/*` path aliases
- Vite + Phaser 3 + React client stack
- Node.js + Socket.io server skeleton
- ESLint + Prettier + Vitest tooling
- 345 dependencies installed and building

#### Sprint 1: Battle Engine
- `BattleEngine` — deterministic state machine (pure function: state + action → new state + events)
- `GridSystem` — 6x3 grid with panel ownership (P1: cols 0-2, P2: cols 3-5)
- `ChipSystem` — chip execution and damage calculations
- `BattleState` type — complete battle state definition
- `NetworkMessages` — Zod-validated message schemas
- 5 core chips defined (Cannon, Sword, etc.)
- 3 viruses defined
- 9 unit tests passing (determinism verified)

#### Sprint 2: Client Rendering & Input
- `BattleScene` — main Phaser scene with full game loop integration
- `GridRenderer` — 6x3 grid rendering with panel colors
- `NaviRenderer` — navi sprite rendering
- `ChipRenderer` — chip visual effects
- `InputHandler` — keyboard input (WASD movement, J buster, K chips, Space custom)
- Press-to-act input (no hold-to-repeat)
- Panel ownership movement restriction
- BattleEngine wired into update loop (createInitialState → applyAction → tick)
- HUD displaying HP, frame count, custom gauge, game over state
- 8 InputHandler tests passing
- TypeScript compilation clean

### Remaining Work

1. **Implement `chip_use` action in BattleEngine** — Wire chip execution through `applyAction()` so selected chips deal damage with visual feedback
2. **Create SimpleAI** — Basic enemy AI (random movement + buster + chip use) so single-player is testable without networking
3. **Create ChipSelectOverlay** — UI for selecting chips from folder when custom gauge is full (Spacebar opens, select chips, confirm)
4. **Browser testing & tuning** — Run `npm run dev`, verify full game loop works end-to-end, fix rendering/timing issues

### Acceptance Criteria

- [ ] Can play a complete battle against AI in the browser
- [ ] Win/lose condition triggers correctly (HP reaches 0)
- [ ] Chips deal damage when used (chip_use action works)
- [ ] Custom gauge fills and enables chip selection
- [ ] AI opponent moves, attacks, and uses chips
- [ ] All tests pass (`npm run test`)
- [ ] TypeScript compiles clean (`npm run type-check`)

---

## Product Backlog (Road to MVP)

Everything below is ordered by priority. Each milestone builds on the previous ones.

### Milestone 1: PVP Multiplayer

**Goal:** Two players can find each other and battle in real-time over the network.

**Scope:**
- Server infrastructure (`SocketManager`, `BattleRoom`, `BattleSimulator`)
- Matchmaking queue (simple FIFO — join queue, match first 2 players)
- Battle rooms with state synchronization (60 tick/second)
- Input validation (server authoritative — never trust client)
- Client networking (`SocketClient`, state reconciliation)
- Zustand battle store for client state management
- Disconnect handling (10s grace period → forfeit)

**Files:**
- `packages/server/src/SocketManager.ts`
- `packages/server/src/matchmaking/Queue.ts`
- `packages/server/src/battle/BattleRoom.ts`
- `packages/server/src/battle/BattleSimulator.ts`
- `packages/client/src/network/SocketClient.ts`
- `packages/client/src/network/StateReconciliation.ts`
- `packages/client/src/stores/battleStore.ts`

**Acceptance Criteria:**
- [ ] Two browser windows can join matchmaking and get matched
- [ ] Complete PVP battle plays out with real-time state sync
- [ ] Server validates all inputs (rejects invalid actions)
- [ ] Disconnected player forfeits after timeout
- [ ] Input lag < 100ms (feels responsive)

### Milestone 2: Campaign Mode

**Goal:** Offline single-player experience with progression — fight viruses, collect chips, manage folder.

**Scope:**
- Campaign manager (mission select, progression)
- Virus AI (pattern-based behavior trees, more sophisticated than SimpleAI)
- Save system (localStorage persistence)
- Chip collection and folder management
- Mission select screen

**Files:**
- `packages/client/src/campaign/CampaignManager.ts`
- `packages/client/src/campaign/VirusAI.ts`
- `packages/client/src/campaign/SaveSystem.ts`

**Acceptance Criteria:**
- [ ] Player can select and complete missions against virus enemies
- [ ] Defeated viruses drop chips that add to collection
- [ ] Chip folder can be edited between battles
- [ ] Progress persists across browser sessions
- [ ] Multiple virus types with distinct AI behaviors

### Milestone 3: Content Expansion

**Goal:** Enough chips, viruses, and variety for engaging gameplay.

**Scope:**
- Expand chip library (~200 chips with diverse elements and effects)
- Expand virus roster (~20 types with unique behaviors)
- NaviCust/CustomProgram system
- Element effectiveness depth

**Files:**
- `packages/shared/src/data/chips.ts` (expand from 5 → ~200)
- `packages/shared/src/data/viruses.ts` (expand from 3 → ~20)
- `packages/shared/src/data/customPrograms.ts`
- `packages/shared/src/battle/DamageCalculation.ts`

**Acceptance Criteria:**
- [ ] 50+ unique chips implemented with distinct effects (stretch: 200)
- [ ] 20+ virus types with unique AI patterns
- [ ] CustomProgram system functional
- [ ] Element system creates strategic depth

### Milestone 4: Polish & UX

**Goal:** The game feels good to play — smooth animations, audio, and professional UI.

**Scope:**
- Main menu, matchmaking screen, battle HUD
- Chip selection UI (folder edit screen)
- Smooth animations (attack, hit, delete, movement)
- Sound effects (royalty-free)
- Particle effects
- Screen transitions
- Pixel art sprites (replace placeholder rectangles)

**Files:**
- `packages/client/src/ui/MainMenu.tsx`
- `packages/client/src/ui/ChipSelect.tsx`
- `packages/client/src/ui/FolderEdit.tsx`
- `packages/client/src/ui/MatchmakingScreen.tsx`
- `packages/client/src/ui/BattleHUD.tsx`

**Acceptance Criteria:**
- [ ] All placeholder graphics replaced with pixel art sprites
- [ ] Attack and movement animations play smoothly
- [ ] Sound effects for key actions (attack, damage, chip select)
- [ ] UI is intuitive and responsive
- [ ] 60 FPS maintained during battle

### Milestone 5: Competitive Features

**Goal:** Features that drive long-term engagement and competitive play.

**Scope:**
- ELO ranking system
- Replay system (record inputs, replay battles)
- Spectator mode
- Tournament brackets
- Leaderboards

**Acceptance Criteria:**
- [ ] Players have visible rank that updates after matches
- [ ] Battles can be saved and replayed
- [ ] Spectators can watch live matches
- [ ] Tournament bracket system functional

### MVP Definition of Done

All 5 milestones complete = shippable product. Specifically:
- PVP multiplayer works reliably with low latency
- Campaign mode provides single-player progression
- Enough content for strategic depth (50+ chips, 20+ viruses)
- Professional UI/UX with animations and audio
- Competitive features drive engagement

---

## Architecture Scalability Notes

How the current architecture supports each milestone:

| Milestone | Architecture Support |
|---|---|
| **PVP Multiplayer** | Deterministic `BattleEngine` already runs on both client and server. Same logic validates on server and predicts on client. Socket.io skeleton exists. |
| **Campaign Mode** | `BattleEngine` runs fully client-side — no server needed. AI just submits actions via `applyAction()` same as a human player. |
| **Content Expansion** | Chips are plain data objects in `chips.ts`. Adding a chip = add data + implement effect in `ChipSystem`. No architectural changes needed. |
| **Polish & UX** | Phaser handles game rendering, React handles UI overlays. Renderer classes (`GridRenderer`, `NaviRenderer`, `ChipRenderer`) are already separated for easy upgrade. |
| **Competitive Features** | Replay system is natural: record all `applyAction()` inputs → replay by re-feeding them to `BattleEngine`. Determinism guarantees identical results. |

---

## Completed Work Log

### Sprint 0 — Project Scaffolding (Complete)
**Deliverables:**
- Root `package.json` with npm workspaces
- `packages/client/` — Vite + Phaser 3 + React
- `packages/server/` — Node.js + Socket.io skeleton
- `packages/shared/` — TypeScript library
- TypeScript configs with `@mmbn/*` path aliases
- ESLint + Prettier + Vitest
- Dev scripts (`npm run dev`, `npm run test`, `npm run type-check`)

### Sprint 1 — Battle Engine (Complete)
**Deliverables:**
- `packages/shared/src/types/BattleState.ts` — full battle state type
- `packages/shared/src/types/Chip.ts` — chip type definitions
- `packages/shared/src/types/GridTypes.ts` — 6x3 grid types
- `packages/shared/src/types/NetworkMessages.ts` — Zod schemas
- `packages/shared/src/battle/BattleEngine.ts` — deterministic state machine
- `packages/shared/src/battle/GridSystem.ts` — panel management
- `packages/shared/src/battle/ChipSystem.ts` — damage calculations
- `packages/shared/src/data/chips.ts` — 5 core chips
- `packages/shared/src/data/viruses.ts` — 3 viruses
- `packages/shared/src/battle/BattleEngine.test.ts` — 9 tests passing

### Sprint 2 — Client Rendering & Input (Complete)
**Deliverables:**
- `packages/client/src/scenes/BattleScene.ts` — main Phaser scene with full BattleEngine integration
- `packages/client/src/rendering/GridRenderer.ts` — 6x3 grid renderer
- `packages/client/src/rendering/NaviRenderer.ts` — navi sprites
- `packages/client/src/rendering/ChipRenderer.ts` — chip visuals
- `packages/client/src/input/InputHandler.ts` — keyboard input (WASD + J/K/Space)
- `packages/client/src/input/InputHandler.test.ts` — 8 tests passing
- Press-to-act input, panel ownership movement validation
- HUD: HP, frame count, custom gauge, game over display

**Key decisions made:**
- 6x3 horizontal grid (not 3x6 vertical)
- Press-to-act input (not hold-to-repeat)
- Buster as always-available basic attack (10 HP, no cooldown)
- Real-time simultaneous model (not turn-based)

---

## Reference

### Core Systems Design

#### Battle System
`BattleEngine` is a pure state machine:
```typescript
BattleEngine.createInitialState(player1Id, player2Id, folder) → BattleState
BattleEngine.tick(state) → { state: BattleState, events: BattleEvent[] }
BattleEngine.applyAction(state, playerId, action) → { state: BattleState, events: BattleEvent[] }
```
- Deterministic: same inputs → same outputs (always)
- JSON-serializable state (plain objects, no class instances)
- Runs identically on client and server

#### Grid Layout
```
OOOXXX      O = Player 1 panels (columns 0-2)
O1OX2X      X = Player 2 panels (columns 3-5)
OOOXXX      1 = P1 start (1,1), 2 = P2 start (4,1)
```
Access: `grid[y][x]` (row-major). Bounds: x=[0,5], y=[0,2].

#### Input Controls
| Key | Action |
|-----|--------|
| W/A/S/D | Move up/left/down/right |
| J | Buster attack (always available, 10 HP) |
| K | Use selected chip |
| Space | Open chip selection |

All keys: press-to-act (no hold-to-repeat).

#### Network Protocol
**Client → Server:** `queue:join`, `battle:input`
**Server → Client:** `match:found`, `battle:start`, `battle:update`, `battle:end`
All messages validated with Zod schemas.

### Performance Targets
- **Client:** 60 FPS during battle, < 3s initial load
- **Server:** 100+ concurrent battles, < 20ms tick processing
- **Network:** ~50KB/s per player, < 100ms perceived input lag

### Testing
- 17 tests passing (9 BattleEngine + 8 InputHandler)
- Shared package tests are critical — verify determinism
- Run: `npm run test:shared` after any battle logic changes

### Deployment — Single DigitalOcean Droplet

**Architecture:** One $6/mo Droplet serves everything. nginx handles static files + WebSocket proxy. Same origin = no CORS.

```
Browser → DigitalOcean Droplet ($6/mo)
            ├── nginx (:80)
            │   ├── /              → packages/client/dist/ (static)
            │   ├── /socket.io     → proxy to Node.js :3000
            │   └── /health        → proxy to Node.js :3000
            └── Node.js + PM2 (:3000)
                └── Socket.io server (game logic)
```

**Key files:**
- `.github/workflows/deploy.yml` — GitHub Actions auto-deploy on push to main
- `scripts/nginx.conf` — nginx config (static files + WebSocket proxy)
- `scripts/setup-droplet.sh` — one-time Droplet provisioning script
- `.env.example` — environment variables reference

**Environment variables:**
| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3000` | Node.js server port |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS origin (dev only — same-origin in prod) |

**GitHub Secrets required:**
- `DO_HOST` — Droplet IP address
- `DO_SSH_KEY` — private SSH key for deploy user
- `DO_USERNAME` — SSH username (e.g., `deploy`)

**Deploy flow:** Push to main → GitHub Actions builds + tests → rsync artifacts to Droplet → npm ci --omit=dev → pm2 restart

**Future scaling:**
- Cloudflare free CDN in front of nginx (DNS change only)
- Upgrade Droplet ($12/mo, $24/mo) for more concurrent battles
- Migrate to Cloudflare Workers + Durable Objects for PVP at scale

---

## Post-First-Playable: Activate Feature Pipeline

> **Reminder:** FEATURES.md defines a structured multi-agent workflow (Explorer → Formalizer → Architecture Review → PM Breakdown → Sprint) for managing feature development. It was evaluated on 2026-02-17 and deferred — the folder infrastructure doesn't exist yet, it conflicts with this PLAN.md, and the overhead isn't justified pre-First Playable.
>
> **When First Playable is complete, revisit FEATURES.md and decide:**
> 1. Whether to activate it as a process layer on top of PLAN.md
> 2. Create `/features/backlog|approved|in_sprint|completed/` folder structure
> 3. Fix Agent 3's reference from `ARCHITECTURE.md` → `CLAUDE.md`
> 4. Add a fast-track tier for trivial/small changes
> 5. Integrate branch naming from BRANCHING.md into Agent 5's prompt
> 6. Create `CHANGELOG.md`

---

## Post-MVP Ideas
- Custom chip creator
- Mobile support (touch controls)
- Progressive Web App
- Community content sharing
- Advanced animations (sprite sheets + texture atlases)

---

**Last Updated:** 2026-02-17
**Next Review:** After First Playable is achieved
