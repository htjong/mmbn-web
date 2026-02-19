# Deployment Guide

## Architecture Overview

```
Push to main
    ↓
GitHub Actions (Ubuntu + Node 22)
    ↓ npm ci → npm run build → npm test
    ↓ rsync --delete → /app/ on Droplet (no node_modules)
    ↓ SSH: npm ci --omit=dev
    ↓ SSH: pm2 restart mmbn-server OR pm2 start dist/index.js --name mmbn-server
    ↓ SSH: pm2 save

DigitalOcean Droplet ($6/mo, 512MB RAM + 1GB swap)
    nginx :80
      ├─ /          → /app/packages/client/dist  (SPA static files)
      ├─ /socket.io → 127.0.0.1:3000             (WebSocket proxy)
      └─ /health    → 127.0.0.1:3000             (health check)
    PM2 → node packages/server/dist/index.js :3000
```

## Trigger

Every push to `main` triggers the full deploy pipeline via GitHub Actions (`.github/workflows/deploy.yml`).

No manual deploys are needed. The pipeline:
1. Checks out the repo and installs deps (`npm ci`)
2. Builds all packages (`npm run build`)
3. Runs all tests (`npm test`)
4. rsyncs the built artifacts to `/app/` on the Droplet (excluding `node_modules`)
5. SSHes in to install production deps and restart the server via PM2

## GitHub Secrets Required

Set these in **Settings → Secrets and variables → Actions** on the GitHub repo:

| Secret | Description |
|--------|-------------|
| `DO_HOST` | Droplet IP address or hostname |
| `DO_USERNAME` | SSH user (typically `deploy`) |
| `DO_SSH_KEY` | Private SSH key with access to the Droplet |

## One-Time Droplet Setup

Run once on a fresh Ubuntu 22.04 Droplet:

```bash
ssh root@DROPLET_IP 'bash -s' < scripts/setup-droplet.sh
```

This script:
- Creates a `deploy` user with SSH access
- Installs Node.js 22 via NodeSource
- Installs PM2 globally
- Installs nginx
- Sets up 1GB swap (critical for the 512MB droplet)
- Creates `/app/` owned by `deploy`
- Configures nginx from `scripts/nginx.conf`
- Starts the server with PM2 and enables startup on reboot

## nginx Configuration

Located at `scripts/nginx.conf`. Applied to `/etc/nginx/sites-available/mmbn` on the Droplet.

Routes:
- `/` — Serves the Vite-built SPA from `/app/packages/client/dist`
- `/socket.io` — Proxies WebSocket traffic to `localhost:3000`
- `/health` — Proxies health check to `localhost:3000`

## PM2 Process Management

The server runs as a PM2 process named `mmbn-server`:

```bash
# Check status
ssh deploy@DROPLET_IP 'pm2 status'

# View logs (live)
ssh deploy@DROPLET_IP 'pm2 logs mmbn-server'

# View recent logs
ssh deploy@DROPLET_IP 'pm2 logs mmbn-server --lines 100'

# Restart manually
ssh deploy@DROPLET_IP 'pm2 restart mmbn-server'
```

PM2 auto-restarts on crash and survives Droplet reboots (via `pm2 startup systemd`).

## Server Entry Point

The server is built with **tsup**, producing `packages/server/dist/index.js`. The `@mmbn/shared` package is bundled inline, so no workspace symlinks are required.

PM2 starts it as:
```
node packages/server/dist/index.js
```

## Environment Variables

Set on the Droplet at `/app/.env` or via PM2's ecosystem file. The server reads:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Port the Node.js server listens on |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for Socket.io |

In production, set `CLIENT_ORIGIN` to the domain or IP where the client is served (e.g., `http://DROPLET_IP`).

## Verifying a Deploy

After a deploy completes:

```bash
# Check PM2 process is running
ssh deploy@DROPLET_IP 'pm2 status'

# Hit the health endpoint
curl http://DROPLET_IP/health
# → {"status":"ok"}

# Check nginx is running
ssh deploy@DROPLET_IP 'systemctl status nginx'
```

## Notes

- **HTTPS:** Not yet configured. The site runs on HTTP only. To add HTTPS, install certbot and configure a Let's Encrypt certificate.
- **Droplet size:** $6/mo (512MB RAM). The 1GB swap file set up by the setup script is important — the Node.js build on the Droplet side (`npm ci --omit=dev`) can be memory-intensive without it.
- **No build on Droplet:** The build runs in GitHub Actions (7GB RAM), and only the compiled artifacts are rsynced to the Droplet. The Droplet only runs `npm ci --omit=dev` to install production dependencies.
