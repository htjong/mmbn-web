# Implement Charge-Weighted Custom Gauge Breathing Glow

## Mode
- Tier: T1
- Formalization: Lite

## Description
Add a breathing glow to the custom gauge that communicates charge progress through motion intensity. The effect is off at 0%, scales smoothly with charge while charging, and reaches maximum contrast at full charge. Cadence stays constant at 1s bright / 1s dim across partial and full states. The glow stops immediately when the custom screen opens.

## Acceptance Criteria
- [ ] At `customGauge === 0`, gauge glow styling is inactive (no breathing opacity/brightness effect).
- [ ] For `0 < customGauge < maxCustomGauge`, pulse amplitude scales continuously with `customGauge / maxCustomGauge`.
- [ ] At `customGauge >= maxCustomGauge`, pulse amplitude is max while cadence remains `1s bright + 1s dim`.
- [ ] Cadence does not change between partial and full charge states.
- [ ] When `customScreenOpen` becomes `true`, glow effect stops immediately.
- [ ] Storybook shows off/low/mid/full states with visibly increasing amplitude.
- [ ] UI tests verify 0%, partial, full, and custom-screen-open behavior.

## Notes
- Key files: `packages/client/src/ui/atoms/GaugeBar.tsx`, `packages/client/src/ui/organisms/BattleHud.tsx`, `packages/client/src/ui/hooks/useBattleHud.ts`, `packages/client/src/ui/atoms/GaugeBar.stories.tsx`, `packages/client/src/stores/battleStore.ts`
- Reuse: `gaugeValue`, `gaugeMax`, `customScreenOpen` from `useBattleHud`; preserve existing width-fill logic.
- Risks: avoid inline style churn; keep pulse animation CSS-driven and only vary intensity by charge.

## Architecture Review
- Determinism:
  - Status: GREEN
  - Evidence: UI-only rendering behavior; no shared simulation logic changes.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- State impact:
  - Status: GREEN
  - Evidence: consumes existing gauge fields; no `BattleState`/`PlayerState` schema updates.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Network/schema:
  - Status: GREEN
  - Evidence: no protocol, socket event, or schema changes.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Grid/panel:
  - Status: GREEN
  - Evidence: no panel rule or ownership behavior touched.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Chip system:
  - Status: GREEN
  - Evidence: no chip types/effects/fields modified.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Client rendering/UI:
  - Status: YELLOW
  - Evidence: pulse visuals can jitter if tied to rerender-heavy inline style updates.
  - Risk: visual instability or unnecessary reflow.
  - Mitigation: use CSS animation plus charge-driven variable intensity only.
  - Blocking: no
- Reuse opportunities:
  - Status: GREEN
  - Evidence: existing `useBattleHud` -> `BattleHud` -> `GaugeBar` path is sufficient.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Risk/order:
  - Status: GREEN
  - Evidence: low blast radius; isolated to HUD gauge visual behavior.
  - Risk: minimal
  - Mitigation: implement style states first, then Storybook, then tests.
  - Blocking: no
