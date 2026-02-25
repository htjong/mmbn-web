# Changelog

Two entry types exist:

**Sprint entries** — record what was implemented in a focused session.
**Milestone entries** — mark when a major deliverable's all ACs are satisfied.

Sprint format: `## Sprint N: Title` / Date / bullets / Key decisions
Milestone format: `## 🏁 Milestone: Name` / Reached date / Sprint range / 2-3 sentence summary

Milestone entries appear **above** the sprint entry that completed them.

---

## Sprint 8: Codex Skill Migration & Local Runtime Hardening
**Date:** 2026-02-23 23:55 PST

- 2026-02-24 19:31 PST: Added battle sprite asset set for player (`MMBN3_MM_LEFT_FIELD_*`) and simpleAI (`MMBN3_FORTE_RIGHT_FIELD_*`) under `assets/` covering ready, move, and buster frames.
- 2026-02-24 19:31 PST: Captured chosen direction in `kanban/ideas/player-ai-sprite-buster-animation.md` and formalized it into `kanban/backlog/player-ai-sprite-buster-animation.md` with T2/Full ACs and architecture review.
- 2026-02-24 15:23 PST: Added backlog-orchestrator developer runbook (`docs/backlog-orchestrator-runbook.md`) and linked it from `README.md` Contributing section.
- 2026-02-24 15:23 PST: Updated `.gitignore` to exclude Playwright artifacts (`test-results`, `playwright-report`) from accidental commits.
- 2026-02-24 06:57 PST: Finalized Feature Workflow v3.2 in `docs/feature-workflow.md` with Codex command syntax (`$feature-explore`, `$feature-formalize`), strict prompt contract, tier rules, blocker rules, version retention, and validation guidance.
- 2026-02-24 06:57 PST: Updated `.codex/skills/feature-explore` and `.codex/skills/feature-formalize` to enforce single-prompt emission, numbered options, and docs-anchored prompt contract parity.
- 2026-02-24 06:57 PST: Added `scripts/validate-prompts.js` and `npm run validate:prompts` for prompt contract + drift checks.
- 2026-02-24 06:57 PST: Moved legacy idea/backlog cards into `kanban/legacy/` and initialized `kanban/backlog/archive/` for version retention.
- 2026-02-24 06:57 PST: Formalized `kanban/backlog/custom-gauge-charge-weighted-breathing.md` (T1/Lite) and `kanban/backlog/start-menu-spacebar-only.md` (T2/Full).
- 2026-02-24 04:25 PST: Hardened `feature-formalize` lifecycle rules to require deleting the source `kanban/ideas/*` card after successful backlog formalization.
- 2026-02-24 04:25 PST: Added backlog card `kanban/backlog/custom-gauge-charge-weighted-breathing.md` with clarified ACs and architecture review.
- 2026-02-24 04:25 PST: Added backlog card `kanban/backlog/start-menu-spacebar-only.md` for Space-only title start behavior.
- 2026-02-24 12:11 PST: Set `.codex/config.toml` approval policy to `never` and retained `on-request` as a commented reference for quick rollback context.
- 2026-02-24 02:36 PST: Updated `work-ceremony-closing` to require explicit user confirmation before killing conflicting processes and to rerun only failed/blocked gates after remediation.
- 2026-02-24 02:59 PST: Added explicit post-close handoff requirements to `work-ceremony-closing` workflow and execution sequences (what to do after the final close step).
- Migrated 10 Claude-era agent/command workflows into repo-local Codex skills
  under `.codex/skills/*` with explicit intent invariants, compatibility maps,
  and output contracts
- Extracted long-form procedural guidance into per-skill `references/` files to
  reduce average skill-context footprint while preserving behavior fidelity
- Added runtime helper scripts:
  - `.codex/scripts/audit-codex-paths.sh` to fail on `.claude/` runtime path references
  - `.codex/scripts/test-and-log.sh` for multi-runner test execution with log capture
- Added `.codex/context/README.md` and captured migration handoff context at
  `.archive/context/codex-skill-migration-context-2026-02-24.md`
- Validated core repo quality gates for this session:
  `npm run type-check`, `npm run lint`, `npm run test`, and Storybook startup

**Key decisions:**
- Codex skills are repo-local (`.codex/skills`) and must not depend on `.claude/*`
- Behavioral parity is preserved via explicit gate ordering and output contracts,
  not by embedding large instruction bodies in each skill

---

## Sprint 7: Sprint Process & Feature Workflow Overhaul
**Date:** 2026-02-19 – 2026-02-23 19:34 PST

- Introduced `sprint/*` integration branch strategy and updated all docs
  (BRANCHING.md, CLAUDE.md, ceremony scripts) to reflect the new git workflow
- Removed context files from the repo — context is now generated locally per
  session and never committed, reducing noise from per-user state files
- Added `/work:ceremony-opening` command to open sprint branches cleanly and
  stamp a placeholder changelog entry
- Hardened `/work:ceremony-closing` with sequential verification gates
  (type-check, lint, tests, dev server, Storybook) and a full merge/tag/push
  sequence; added code-change detection in Step 2a to skip the `analyze-code`
  agent when only docs/kanban/.claude files changed
- Added test-runner agent and wired it into ceremony-closing's failure path for
  deep test diagnosis
- Updated `/feature:formalize` to embed the source idea card's full content into
  the backlog card under `## Origin` then delete the idea file, making backlog
  cards fully self-contained
- Updated `/feature:explore` handoff message to set user expectations about the
  embed-and-delete behavior
- Promoted game-start-menu idea to a formalized backlog card with full spec and
  architecture review

- Implemented game start menu — TitleScreen organism with MMBN-styled title,
  blinking "PRESS ENTER TO START" prompt, and Enter/click to start; gated behind
  `gamePhase: 'menu' | 'battle'` in Zustand store; `App` root component routes
  between TitleScreen and BattleHud based on phase
- Gated `BattleScene.update()` on `gamePhase` so the engine is frozen during the
  title screen; `BattleScene.create()` still pre-loads battle state so chip select
  opens immediately on game start
- Added context-aware battle controls hint to ChipSelectPanel — shows
  `WASD: move · K: use chip · J: buster · Space: open chip selection` when chip
  select is inactive at full opacity, while chip content remains dimmed
- Added TitleScreen Storybook story
- Pointed subdomain mmbn.howardtjong.com (Namecheap A record) at DigitalOcean
  Droplet IP; diagnosed HTTPS redirect issue — Nginx config had `server_name _;`
  (catch-all) which blocked Certbot from matching the domain; fixed by setting
  `server_name mmbn.howardtjong.com;` in `/etc/nginx/sites-enabled/mmbn`, then ran
  `certbot install --cert-name mmbn.howardtjong.com` to complete SSL installation;
  site now serves HTTPS with valid cert, pending DNS propagation

**Key decisions:**
- Idea cards are deleted after formalization — their content lives on in the
  backlog card's `## Origin` section, keeping the board clean without losing history
- Context files are gitignored and generated locally; no per-user state in the repo
- Code analysis is skipped when no code files changed — avoids wasted agent cost
  on doc-only sessions

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
