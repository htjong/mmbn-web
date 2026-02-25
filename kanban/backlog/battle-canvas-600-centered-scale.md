# Increase Battle Canvas Height and Center Aspect-Safe Scene Scaling

## Mode
- Tier: T1
- Formalization: Full

## Description
Increase the battle canvas height from 240 to 600 for battle presentation. Render the battle scene at a target 1.2x uniform scale while preserving aspect ratio and centering the scene within the canvas. When 1.2x would clip on constrained viewports, reduce scale just enough to fit the full scene while keeping centering and aspect lock.

## Acceptance Criteria
- [ ] Battle canvas height is 600 during battle rendering.
- [ ] Battle scene uses uniform aspect-ratio-preserving scaling with a target factor of 1.2x.
- [ ] Battle scene is centered within the canvas after scaling.
- [ ] If the target 1.2x scale would clip scene bounds, scale is reduced to the maximum fit value below 1.2x that avoids clipping.
- [ ] Rendering never applies independent X/Y stretch at any viewport size.
- [ ] Existing battle logic cadence and input-to-action behavior remain unchanged by the rendering update.
- [ ] Automated tests cover target 1.2x behavior, fit-down behavior under constrained viewport, and centering invariants.

## Notes
- Key files: `packages/client/src/main.ts`, `packages/client/src/scenes/BattleScene.ts`, `packages/client/index.html`
- Reuse: existing Phaser scene/camera lifecycle and current `BattleScene` rendering path.
- Risks: fit-down calculations can drift from centering math and cause subtle offset jitter if not derived from a single scale source.

## Architecture Review
- Determinism:
  - Status: GREEN
  - Evidence: Change is limited to client-side presentation sizing/scaling and does not modify shared battle simulation logic.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- State impact:
  - Status: GREEN
  - Evidence: No new shared `BattleState` or `PlayerState` fields are required for canvas sizing behavior.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Network/schema:
  - Status: GREEN
  - Evidence: Rendering-only behavior does not add or alter messages, payloads, or protocol schemas.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Grid/panel:
  - Status: GREEN
  - Evidence: Grid rules and panel occupancy remain unchanged; only final visual transform is adjusted.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Chip system:
  - Status: GREEN
  - Evidence: Chip types, execution, and effects are not touched by canvas scale/centering changes.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Client rendering/UI:
  - Status: YELLOW
  - Evidence: Canvas dimension and scene scale math are central to frame composition and can regress alignment across viewports.
  - Risk: clipped content, off-center composition, or scale jitter under constrained layouts.
  - Mitigation: use one authoritative scale calculation, assert centering offsets, and add viewport-variant tests.
  - Blocking: no
- Reuse opportunities:
  - Status: GREEN
  - Evidence: Existing Phaser config and `BattleScene` render pipeline can be extended without introducing new render subsystems.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Risk/order:
  - Status: GREEN
  - Evidence: Implementation can proceed in small sequence: canvas height update, scale/center math, fit-down guard, then tests.
  - Risk: low
  - Mitigation: validate each step with focused rendering checks before integration.
  - Blocking: no
