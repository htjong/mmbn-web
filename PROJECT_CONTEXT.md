# Current Goal

Complete First Playable — a playable single-player battle against AI in the browser. Deployment infrastructure is now live on DigitalOcean.

# Architecture

- **Monorepo**: `packages/shared` (deterministic battle logic), `packages/client` (Phaser 3 + React), `packages/server` (Node.js + Socket.io)
- **Battle Engine**: Pure state machine in shared — `createInitialState()`, `tick()`, `applyAction()` — runs identically on client and server
- **Grid**: 6x3 (6 columns, 3 rows), `grid[y][x]`, P1 owns cols 0-2, P2 owns cols 3-5
- **Input**: WASD movement, J buster, K chip, Space custom bar — press-to-act (no hold repeat)
- **Server**: Socket.io with matchmaking queue, battle rooms, and authoritative simulation
- **Deployment**: Single $6/mo DigitalOcean Droplet — nginx serves static files, proxies `/socket.io` to Node.js on port 3000. GitHub Actions builds in CI and rsyncs artifacts to Droplet.

# Decisions Made

- Real-time simultaneous gameplay (not turn-based) — both players act independently, no turn phases
- Deterministic shared engine enables client-side prediction + server authority
- Buster mechanic as always-available fallback attack (10 HP damage, no cooldown)
- Press-to-act input (keysJustPressed) instead of hold-to-repeat for precise control
- Panel ownership restricts movement — players cannot cross into opponent territory
- 6x3 horizontal grid layout (was originally vertical 3x6, corrected early)
- Build in GitHub Actions (7GB RAM), not on Droplet (512MB) — avoids OOM during Vite build
- Same-origin deployment (nginx proxy) eliminates CORS complexity
- Dedicated `deploy` SSH user with separate key pair for CI/CD
- Node 22 aligned across local, CI, and Droplet

# What Changed Recently

- **Deployment infrastructure live**: GitHub Actions CI/CD pipeline deploying to DigitalOcean Droplet
- **Health endpoint added** to server (`/health` returns JSON status)
- **CORS restricted** to `CLIENT_ORIGIN` env var (defaults to `localhost:5173` for dev)
- **Build ordering fixed**: Root `npm run build` now runs shared → client → server (was alphabetical, broke builds)
- **Git author fixed**: All commits rewritten from `MMBN Dev` to `htjong` with correct GitHub email
- **Server tests**: Added `--passWithNoTests` flag so CI doesn't fail when no server test files exist

# Known Issues / Open Questions

- **First Playable remaining work**: chip_use action, SimpleAI, ChipSelectOverlay, browser testing
- **No AI opponent yet**: Can't easily test battle without second player or simple AI

# Next Steps

1. Implement `chip_use` action in BattleEngine
2. Create SimpleAI for single-player testing
3. Create ChipSelectOverlay UI
4. Browser testing & tuning — verify full game loop end-to-end
5. Verify deployment serves the game correctly at Droplet IP

# How to Resume

```bash
# Check current state
npm run type-check          # Should pass
npm run test                # All tests pass (9 shared + 9 client input)

# Start dev server for browser testing
npm run dev                 # Client on :5173, Server on :3000

# Key files
.github/workflows/deploy.yml              # CI/CD pipeline
scripts/nginx.conf                         # nginx config
scripts/setup-droplet.sh                   # Droplet provisioning
packages/server/src/index.ts               # Server entry + health endpoint
PLAN.md                                    # Full roadmap and progress
```
