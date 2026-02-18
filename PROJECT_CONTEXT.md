# Current Goal

Complete First Playable — a playable single-player battle against AI in the browser. Deployment infrastructure is live and verified on DigitalOcean.

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
- ESM `.js` extensions required on all relative imports (Node ESM strict resolution in production)
- Server dist output at `dist/server/src/` due to cross-package tsc compilation

# What Changed Recently

- **Deployment fully live and verified**: Game accessible at Droplet IP, `/health` endpoint working
- **ESM import fix**: Added `.js` extensions to all relative imports across shared and server packages — required for Node ESM strict resolution in production (ts-node-dev handles this in dev but `node` does not)
- **Server dist path corrected**: tsc outputs to `dist/server/src/` (not `dist/`) due to cross-package compilation with shared. All start scripts and PM2 commands updated.
- **Root tsconfig `rootDir` removed**: Was causing nested dist output in shared package. Shared now outputs flat to `dist/`.
- **nginx config manually installed** on Droplet (setup script's OOM failure during initial run skipped the nginx section)
- **PM2 first-deploy handling**: Deploy workflow uses `pm2 describe || pm2 start` to handle both first deploy and subsequent restarts

# Known Issues / Open Questions

- **First Playable remaining work**: chip_use action, SimpleAI, ChipSelectOverlay, browser testing
- **No AI opponent yet**: Can't easily test battle without second player or simple AI
- **Stale build artifacts**: If tsc previously output into `src/` (e.g., `.js`, `.d.ts`, `.map` files), delete them manually. The `.gitignore` excludes `dist` but not source-dir artifacts.

# Next Steps

1. Implement `chip_use` action in BattleEngine
2. Create SimpleAI for single-player testing
3. Create ChipSelectOverlay UI
4. Browser testing & tuning — verify full game loop end-to-end

# How to Resume

```bash
# Check current state
npm run type-check          # Should pass
npm run test                # All tests pass (9 shared + 9 client input)

# Start dev server for browser testing
npm run dev                 # Client on :5173, Server on :3000

# Production build + local test
npm run build
node packages/server/dist/server/src/index.js   # Should start on :3000
curl http://localhost:3000/health                # Should return {"status":"ok"}

# Key files
.github/workflows/deploy.yml              # CI/CD pipeline
scripts/nginx.conf                         # nginx config
scripts/setup-droplet.sh                   # Droplet provisioning
packages/server/src/index.ts               # Server entry + health endpoint
kanban/PLAN.md                             # Full roadmap and progress
```
