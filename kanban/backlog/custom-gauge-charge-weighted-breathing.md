# Implement Charge-Weighted Custom Gauge Breathing Glow

## Description
Add a breathing glow to the custom gauge that communicates charge progress through motion intensity. The glow stays off at 0%, then progressively increases pulse amplitude as charge approaches full. At 100%, the gauge continues the same 1-second bright / 1-second dim rhythm at maximum contrast until the custom screen opens. When the custom screen opens, the glow stops immediately.

## Acceptance Criteria
- [ ] At `customGauge === 0`, gauge glow styling is inactive (no breathing opacity/brightness effect).
- [ ] For `0 < customGauge < maxCustomGauge`, breathing pulse amplitude scales continuously with `customGauge / maxCustomGauge` (higher charge produces visibly stronger bright/dim contrast).
- [ ] At `customGauge >= maxCustomGauge`, the gauge keeps pulsing with maximum amplitude and does not freeze to a static full-state style.
- [ ] Breathing cadence is exactly `1s bright + 1s dim` in real-time UI animation timing (not battle-tick/frame-derived).
- [ ] When `customScreenOpen` becomes `true`, glow effect stops immediately for the hidden/inactive gauge state.
- [ ] GaugeBar Storybook includes examples that make the progression clear (off/low/mid/full pulse intensity).
- [ ] UI tests verify state-to-style behavior for 0%, partial, full, and custom-screen-open cases.

## Notes
- Key files: `packages/client/src/ui/atoms/GaugeBar.tsx`, `packages/client/src/ui/organisms/BattleHud.tsx`, `packages/client/src/ui/hooks/useBattleHud.ts`, `packages/client/src/ui/atoms/GaugeBar.stories.tsx`, `packages/client/src/stores/battleStore.ts`
- Reuse: existing `gaugeValue`, `gaugeMax`, and `customScreenOpen` from `useBattleHud`; preserve existing width-fill logic and layer pulse styling on top.
- Risks: frequent inline style recomputation can cause visual jitter/perf issues; ensure pulse is CSS-driven and only intensity parameter changes with charge.

## Architecture Review
- Determinism in shared battle logic: no impact; animation is client-only and not tied to simulation logic.
- State impact on `BattleState` / `PlayerState`: no schema changes; consumes existing `customGauge` and `maxCustomGauge`.
- Network message/schema impact: none.
- Grid/panel rule impact: none.
- Chip-system type/effect impact: none.
- Client rendering/UI impact: GaugeBar visual behavior changes and needs explicit style states for 0/partial/full/custom-screen-open.
- Existing code reuse opportunities: reuse current HUD gauge data path (`useBattleHud` -> `BattleHud` -> `GaugeBar`) and existing full-state detection.
- Risk and implementation order: implement `GaugeBar` pulse math/CSS first, pass `customScreenOpen` state if needed, then update Storybook, then add tests.

## Blockers
- None.
