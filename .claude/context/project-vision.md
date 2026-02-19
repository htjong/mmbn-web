---
created: 2026-02-19T02:35:20Z
last_updated: 2026-02-19T02:35:20Z
version: 1.0
author: Claude Code PM System
---

# Project Vision

## Long-Term Vision

The most faithful, accessible MMBN battle experience on the web — playable instantly in any browser, with real-time competitive PVP and a deep campaign mode.

## Strategic Priorities (ordered)

1. **Playability first** — A broken or incomplete battle loop is worthless. Get First Playable → iterate → MVP. Don't over-engineer prematurely.
2. **PVP as the differentiator** — MMBN never had real online PVP. This is the feature that makes the project unique and gives it longevity.
3. **Content depth** — A deep chip library (200+) and diverse virus roster create strategic richness. The architecture supports adding content as pure data.
4. **Competitive meta** — ELO, replays, spectator, and tournaments transform a fun game into a community.

## Architecture Vision

The current architecture already supports the full vision:
- **Deterministic engine** → replay system is free (record inputs, replay them)
- **Server-authoritative** → cheating impossible in PVP, enabling fair ranked play
- **Content as data** → scaling to 200 chips requires no architectural work
- **Phaser + React split** → UI can be polished independently of game logic

## Post-MVP Ideas (from `kanban/ideas/`)

- **Advanced animations** — Frame-by-frame attack/hit/delete animations
- **Progressive Web App** — Offline campaign without a server (already mostly possible)
- **Mobile support** — Touch controls, responsive layout
- **Custom chip creator** — Player-designed chips
- **Community content sharing** — Share folders, custom challenges

## What Done Looks Like

**MVP done** = a stranger can open the URL, play campaign, queue for PVP, get matched, play a real match against another human, and see their rank update. The entire experience needs no instructions — it's intuitive, responsive, and polished.

## Non-Goals

- Replicating MMBN3's story or dialogue
- Exact pixel-for-pixel sprite replication (inspired by, not copied)
- Native mobile app (web-first, mobile as stretch)
- Monetization (this is a fan project)
