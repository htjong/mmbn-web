Add a breathing glow to the custom gauge that communicates charge progress through motion intensity. The glow stays off at 0%, then progressively increases pulse amplitude as charge approaches full. At 100%, the gauge continues the same 1-second bright / 1-second dim rhythm at maximum contrast until the custom screen opens. When the custom screen opens, the glow stops immediately.

Acceptance Criteria
- [ ] At `customGauge === 0`, gauge glow styling is inactive (no breathing opacity/brightness effect).
- [ ] For `0 < customGauge < maxCustomGauge`, breathing pulse amplitude scales continuously with `customGauge / maxCustomGauge` (higher charge produces visibly stronger bright/dim contrast).
- [ ] At `customGauge >= maxCustomGauge`, the gauge keeps pulsing with maximum amplitude and does not freeze to a static full-state style.
- [ ] Breathing cadence is exactly `1s bright + 1s dim` in real-time UI animation timing (not battle-tick/frame-derived).
- [ ] When `customScreenOpen` becomes `true`, glow effect stops immediately for the hidden/inactive gauge state.
- [ ] GaugeBar Storybook includes examples that make the progression clear (off/low/mid/full pulse intensity).
- [ ] UI tests verify state-to-style behavior for 0%, partial, full, and custom-screen-open cases.
## Chosen Direction: Pure Charge Breath
**Concept:** The gauge acts like a calm heartbeat that scales only with charge percentage. It focuses on continuous readability from empty to full without extra alert states.
**Key Mechanic:** Pulse intensity maps directly to charge ratio.
**What It Adds:** Clean, low-noise feedback that supports focus during fast play.
