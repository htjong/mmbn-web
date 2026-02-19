---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T02:35:20Z
version: 1.0
author: Claude Code PM System
---

# Product Context

## Target Users

**Primary:** MMBN fans (Mega Man Battle Network series players) who want to play an MMBN-style game in the browser without any download or install.

**Secondary:** Competitive players who want real-time 1v1 PVP with ranked matchmaking — a competitive ladder for a genre that never got one on PC/web.

## Core Gameplay Loop

1. **Folder building** — Curate a set of chips before battle (up to 30 chips in folder, select up to 5 per custom screen activation)
2. **Battle** — Real-time 1v1 on a 6x3 grid. Move your navi, dodge attacks, wait for custom gauge to fill, select chips, execute them.
3. **Win condition** — Reduce opponent's HP to 0.

## Key Differentiators from Reference (MMBN3)

| Feature | MMBN3 (GBA) | This Project |
|---------|-------------|-------------|
| Platform | GBA cartridge | Browser (no install) |
| PVP | Link cable only | Real-time WebSocket PVP |
| Campaign | Story-driven | Wave/mission-based |
| Target | Handheld, offline | Web, always-online option |

## Game Modes

### Campaign Mode (Offline)
- Single-player battles against virus AI
- Progression: defeat viruses → earn chips → build better folder → tackle harder viruses
- Persistence via localStorage
- No server required — runs entirely in browser

### PVP Mode (Online)
- Real-time 1v1 matchmaking (FIFO queue)
- Server-authoritative (cheating not possible)
- ELO ranking (planned post-MVP)

## Controls (Keyboard)

| Key | Action |
|-----|--------|
| W A S D | Move navi (one step per press) |
| Space | Open custom screen (chip selection) |
| K | Use selected chip |
| J | Buster attack (basic, always available) |

Press-to-act. No repeat on hold.

## Core Mechanics

- **Custom Gauge** — Fills automatically over time. When full, player can open the chip selection screen and choose up to 5 chips.
- **Buster** — Always available, 1 damage, same-row only, no cooldown.
- **Chips** — Queued from selection, used one at a time with K. Vary by element and effect.
- **Elements** — Fire → Wood → Elec → Aqua → Fire (2x advantage, 0.5x disadvantage)
- **Movement** — Manhattan-distance-1 moves only. Cannot cross into opponent's columns.

## Content Targets (MVP)

- **Chips:** 50+ unique chips (stretch: 200)
- **Viruses:** 20+ types with distinct AI patterns
- **Folder size:** 30 chips, select up to 5 per custom screen

## Success Criteria

- **First Playable:** A single complete battle against AI works end-to-end in the browser
- **MVP:** PVP works reliably, campaign has progression, 50+ chips, polished UI/UX, competitive features
