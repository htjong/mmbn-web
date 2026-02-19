# MMBN Web

A Mega Man Battle Network 3-inspired web game. Real-time 1v1 PVP over WebSockets, plus offline campaign mode against AI — all in the browser.

> **Status:** First Playable in progress — single-player battle against AI.

---

## Quick Start

```bash
npm install
npm run dev
```

- Client: http://localhost:5173
- Server: http://localhost:3000

Requires Node.js >= 22.

---

## Controls

| Key | Action |
|-----|--------|
| `W A S D` | Move navi |
| `Space` | Open chip selection |
| `K` | Use selected chip |
| `J` | Buster attack |

Each key press = one action. Holding does not repeat.

---

## Project Structure

```
packages/
├── shared/   # Game logic & types — runs on client and server
├── client/   # Browser game (Vite + Phaser 3 + React)
└── server/   # WebSocket server (Node.js + Socket.io)
```

The battle engine in `shared` is deterministic — identical logic runs on both client (prediction) and server (validation). See [CLAUDE.md](./CLAUDE.md) for architecture details.

---

## Dev Commands

```bash
npm run dev           # Start client + server (watch mode)
npm run test          # Run all tests
npm run test:shared   # Battle logic tests (run these after any engine change)
npm run type-check    # TypeScript compilation check
npm run lint          # ESLint
npm run build         # Build all packages
```

---

## Roadmap

Current target: **First Playable** — a complete single-player battle against AI.

After that:

1. PVP Multiplayer
2. Campaign Mode (progression, chip drops, folder management)
3. Content Expansion (chips, viruses)
4. Polish & UX (sprites, animations, audio)
5. Competitive Features (rankings, replays, spectator)

Full roadmap: [kanban/PLAN.md](./kanban/PLAN.md)

---

## Deployment

Pushes to `main` trigger a GitHub Actions pipeline that builds, tests, and deploys to a DigitalOcean Droplet via rsync + PM2.

```bash
# Check server status
ssh deploy@DROPLET_IP 'pm2 status'

# View live logs
ssh deploy@DROPLET_IP 'pm2 logs mmbn-server'

# Hit health endpoint
curl http://DROPLET_IP/health
```

Full deployment guide: [docs/deployment.md](./docs/deployment.md)

---

## Notes
Game data: https://www.therockmanexezone.com/wiki/Mega_Man_Battle_Network_3

---

## Contributing

- Git workflow: [docs/BRANCHING.md](./docs/BRANCHING.md)
- Task tracking: [kanban/](./kanban/)
- Architecture & patterns: [CLAUDE.md](./CLAUDE.md)
- Changelog: [kanban/CHANGELOG.md](./kanban/CHANGELOG.md)
