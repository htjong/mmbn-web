# Implement Player and SimpleAI Sprite Animation With Timed Buster Resolution

## Mode
- Tier: T2
- Formalization: Full

## Description
Replace placeholder battler rectangles with the provided sprite sets for player (`MMBN3_MM`) and simpleAI (`MMBN3_FORTE`) across ready, movement, and buster actions. Buster firing must animate over 4 frames at 100ms per frame, resolve damage 100ms after the final frame, and enforce a 200ms cooldown before the next shot can start. Movement must animate over 3 frames at 100ms per frame from source to destination. Ready animation cycles every 100ms while no other action is active, and buster input requires one shot per discrete `J` key press (no hold-to-auto-fire).

## Acceptance Criteria
- [x] Both combatants render with provided sprite assets (no placeholder rectangle rendering during battle).
- [x] Ready state uses 4-frame loops at 100ms per frame for both player and simpleAI whenever no other action is active.
- [x] Movement uses 3-frame animation at 100ms per frame: source-cell frame, in-transition frame, and landing frame on destination cell.
- [x] Buster firing uses 4 frames at 100ms per frame (400ms total) for both player and simpleAI.
- [x] Buster damage lands exactly 100ms after frame 4 completes, and not earlier.
- [x] After buster hit lands, a 200ms cooldown blocks the next buster start for that actor.
- [x] Holding `J` does not auto-fire; one new physical press is required per buster attempt.
- [x] Automated tests cover timing gates for fire/land/cooldown and confirm parity between player and simpleAI behavior.
- [x] Visual/render tests (or deterministic renderer assertions) cover ready, movement, and buster frame progression for both actors.

## Notes
- Key files: `packages/client/src/rendering/NaviRenderer.ts`, `packages/client/src/scenes/BattleScene.ts`, `packages/client/src/input/InputHandler.ts`, `packages/shared/src/battle/BattleEngine.ts`, `packages/shared/src/types/BattleState.ts`, `packages/shared/src/battle/SimpleAI.ts`
- Reuse: keep `InputHandler.keysJustPressed` semantics for non-held fire input, keep `BattleEngine.applyAction` as the single action-resolution path, and align simpleAI attack cadence through existing `attackCooldown` flow.
- Risks: mixing render-time animation timers with shared hit timing can desync visuals and damage events if not driven from one timing contract.

## Architecture Review
- Determinism:
  - Status: YELLOW
  - Evidence: buster land delay introduces time-offset resolution beyond current immediate `applyAction('buster')`.
  - Risk: client/server divergence if delayed hit timing is implemented outside shared engine frames.
  - Mitigation: represent buster windup/landing via shared-frame counters in `BattleEngine` state, not local timers.
  - Blocking: no
- State impact:
  - Status: YELLOW
  - Evidence: existing `PlayerState` has only `busterCooldown` and lacks explicit buster phase/timer fields.
  - Risk: ad hoc local state can split authoritative timing from battle simulation.
  - Mitigation: add explicit shared fields for buster phase and remaining frames/cooldown.
  - Blocking: no
- Network/schema:
  - Status: YELLOW
  - Evidence: any new `BattleState` player fields flow through shared state serialization.
  - Risk: stale consumers may assume prior shape.
  - Mitigation: keep additions backward-compatible and update all typed consumers in client/server packages.
  - Blocking: no
- Grid/panel:
  - Status: GREEN
  - Evidence: no panel ownership or movement validity rules change.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Chip system:
  - Status: GREEN
  - Evidence: chip data and chip effect processing are unchanged.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Client rendering/UI:
  - Status: YELLOW
  - Evidence: renderer shifts from simple rectangles to stateful sprite animation tracks.
  - Risk: frame-order bugs and action-priority conflicts (ready vs move vs buster).
  - Mitigation: enforce explicit animation priority and test frame transitions against shared action state.
  - Blocking: no
- Reuse opportunities:
  - Status: GREEN
  - Evidence: existing `InputHandler`, `BattleScene` update loop, and shared `applyAction`/`tick` flows can be extended.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Risk/order:
  - Status: GREEN
  - Evidence: safe order is shared timing/state first, then renderer integration, then AI cadence alignment, then tests.
  - Risk: moderate integration risk if order is reversed.
  - Mitigation: implement and validate in the stated order.
  - Blocking: no
