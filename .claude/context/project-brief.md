---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T02:35:20Z
version: 1.0
author: Claude Code PM System
---

# Project Brief

## What It Is

A browser-based game inspired by Mega Man Battle Network 3 (MMBN3, GBA, 2003). Players battle in real-time on a 6x3 grid, using movement, buster attacks, and collectible chips to defeat opponents.

## Why It Exists

MMBN3's battle system is widely loved but locked to aging hardware. No browser-playable faithful recreation exists. This project brings that combat system to the web with modern features — specifically real-time PVP (which MMBN only supported via link cable) and campaign progression.

## Scope

**In scope (MVP):**
- Faithful MMBN3 battle mechanics (grid, custom gauge, chips, elements, buster)
- Campaign mode: offline single-player vs AI with chip progression
- PVP mode: real-time 1v1 WebSocket matchmaking
- Chip library (~50+ chips), virus roster (~20+ types)
- Polish: pixel art sprites, animations, sound, HUD

**Out of scope (post-MVP):**
- Story/dialogue (campaign is mission-based, not narrative)
- Mobile/touch controls
- Chip trading / social features
- Custom chip creator (idea card exists)
- Community content sharing

## Architecture Constraints

- **Deterministic engine** — `BattleEngine` must be pure and side-effect free. No RNG in core battle logic.
- **Shared logic** — Identical code runs on client (prediction) and server (validation). Never duplicate battle logic.
- **TypeScript strict** — No `any`, no broken types, compilation must pass before commit.
- **ESM throughout** — All packages use `"type": "module"`. Relative imports in shared/server use `.js` extensions.

## Key Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Game engine | Phaser 3 | Mature, browser-native, WebGL/Canvas 2D |
| UI layer | React + Zustand | Separate game canvas from UI overlays |
| Networking | Socket.io | Reliable WebSocket with fallback, rooms built-in |
| Validation | Zod | Runtime type safety on network messages |
| Monorepo | npm workspaces | Share logic between client and server without publishing |

## Milestones Summary

1. **First Playable** ← current
2. PVP Multiplayer
3. Campaign Mode
4. Content Expansion
5. Polish & UX
6. Competitive Features → **MVP**

Full roadmap: `kanban/PLAN.md`
