# PLAN.md — MMBN Web Game

> **Status:** Living document — updated as development progresses
> **Last Updated:** 2026-02-18
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
- Individual tasks are tracked in **[kanban/](./kanban/)** — ideas, backlog, and ongoing work
- Completion history lives in **[CHANGELOG.md](./CHANGELOG.md)**
- Features are tracked in the **Product Backlog** below as milestones
- Each milestone has **acceptance criteria** defining "done"
- We ship incrementally: First Playable → iterate → MVP

### Workflow

Every piece of work follows this path. The folder a card is in IS its status.

#### 1. Capture → `kanban/ideas/`
**What:** Any thought worth writing down. One-liner, no template.
**Gate to next:** Someone specs it out (adds Description, Acceptance Criteria, Notes).

#### 2. Spec → `kanban/backlog/`
**What:** Specced card with clear acceptance criteria. Ready to pick up.
**Template:** Description, Acceptance Criteria (checkboxes), Dependencies (only if blocked by another card), Notes.
**Gate to next:** Work begins. Move the file to `ongoing/`.

#### 3. Build → `kanban/ongoing/`
**What:** Actively being worked on. Add a Progress section as work happens.
**Rule:** Max 3 cards in ongoing at any time. Finish before starting new work.
**Gate to next:** All acceptance criteria on the card are checked off. Tests pass.

#### 4. Ship → delete card, update docs
**When card AC are all checked:**
1. Check off the corresponding sprint AC in PLAN.md
2. Delete the card from `kanban/ongoing/`
3. Add a line to CHANGELOG.md under the current sprint

**When ALL sprint AC in PLAN.md are checked:**
1. Mark the sprint complete in PLAN.md (status → COMPLETE)
2. Set the next sprint as current
3. Move backlog cards for the next sprint into view

#### Reading project state at a glance
- **What's being worked on right now?** → `ls kanban/ongoing/`
- **What's queued next?** → `ls kanban/backlog/`
- **How far along is the sprint?** → Check the sprint AC checkboxes in PLAN.md
- **What's been shipped?** → Read CHANGELOG.md
- **Raw ideas?** → `ls kanban/ideas/`

---

## Current Sprint: First Playable

**Status:** IN PROGRESS
**Goal:** Playable single-player battle against AI in the browser
**Remaining work:** See [kanban/backlog/](./kanban/backlog/)

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

## Post-MVP Ideas

See [kanban/ideas/](./kanban/ideas/) for post-MVP ideas and raw thoughts.

---

**Last Updated:** 2026-02-18
**Next Review:** After First Playable is achieved
