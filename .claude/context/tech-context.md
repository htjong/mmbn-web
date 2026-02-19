---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T04:33:14Z
version: 1.1
author: Claude Code PM System
---

# Tech Context

## Runtime Requirements

- **Node.js:** >= 22.0.0
- **Package manager:** npm (workspaces)
- **Module system:** ESM (`"type": "module"` in all packages)

## Language & Build

| Tool | Version | Scope |
|------|---------|-------|
| TypeScript | ^5.3.3 | All packages |
| Vite | ^5.1.0 | Client build & dev server |
| tsc | ^5.3.3 | Shared compilation (type-check only for server) |
| tsup | ^8.0.0 | Server production build (esbuild, bundles @mmbn/shared inline) |
| tsx | ^4.21.0 | Server dev hot-reload (replaces ts-node-dev) |

## Client Dependencies (`@mmbn/client`)

| Package | Version | Purpose |
|---------|---------|---------|
| Phaser | ^3.55.2 | Game engine — grid, sprites, game loop |
| React | ^18.2.0 | UI overlays (menus, HUD, chip select) |
| react-dom | ^18.2.0 | React DOM renderer |
| socket.io-client | ^4.7.2 | WebSocket client for PVP |
| zustand | ^4.4.1 | Client-side state management |
| @mmbn/shared | * | Shared game logic |

## Shared Dependencies (`@mmbn/shared`)

| Package | Version | Purpose |
|---------|---------|---------|
| zod | ^3.22.4 | Schema validation for network messages |

## Server Dependencies (`@mmbn/server`)

| Package | Version | Purpose |
|---------|---------|---------|
| socket.io | ^4.7.2 | WebSocket server for PVP |
| @mmbn/shared | * | Shared game logic (same BattleEngine) |

## Dev Tools (root)

| Tool | Version | Purpose |
|------|---------|---------|
| ESLint | ^8.56.0 | Linting |
| @typescript-eslint/* | ^6.17.0 | TypeScript ESLint rules |
| Prettier | ^3.1.1 | Code formatting |
| concurrently | ^8.2.2 | Run client + server in parallel |

## Testing

| Tool | Scope |
|------|-------|
| Vitest | All packages (shared, client, server) |
| jsdom | Client tests (DOM environment) |

## Key Config Files

- `tsconfig.json` — Root TypeScript config with path aliases
- `packages/client/vite.config.ts` — Vite config with `@shared` and `@client` aliases
- `packages/client/vitest.config.ts` — Client test config with jsdom environment
- `packages/server/tsup.config.ts` — tsup config (ESM output, Node 20, `@mmbn/shared` inlined)

## Path Aliases

```typescript
import { BattleEngine } from '@mmbn/shared';  // Cross-package (any package)
import { ... } from '@shared/...';             // Within client (maps to packages/shared/src)
import { ... } from '@client/...';             // Within client (maps to packages/client/src)
```

## Server Build Output

Server builds with **tsup** to a single bundled file at `packages/server/dist/index.js`. `@mmbn/shared` is inlined — no workspace symlinks needed on the Droplet. Dev mode uses `tsx watch src/index.ts` (not ts-node-dev).

## Dev Server Ports

- Client (Vite): `http://localhost:5173`
- Server (Socket.io): `http://localhost:3000`
