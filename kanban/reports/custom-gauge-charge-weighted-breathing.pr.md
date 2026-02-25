## Summary
Automated orchestration output for custom-gauge-charge-weighted-breathing.

## Acceptance Criteria Trace
| AC | Status | Evidence |
| --- | --- | --- |
| AC1: At `customGauge === 0`, gauge glow styling is inactive (no breathing opacity/brightness effect). | pass | GaugeBar zero glow unit; BattleHud zero glow integration; GaugeBar Off story; Gauge zero no pulse |
| AC2: For `0 < customGauge < maxCustomGauge`, pulse amplitude scales continuously with `customGauge / maxCustomGauge`. | pass | GaugeBar scaled amplitude unit; BattleHud charge scaling integration; GaugeBar Low Mid stories; Gauge partial scaling |
| AC3: At `customGauge >= maxCustomGauge`, pulse amplitude is max while cadence remains `1s bright + 1s dim`. | pass | GaugeBar full max amplitude unit; BattleHud full charge integration; GaugeBar Full story; Gauge full pulse |
| AC4: Cadence does not change between partial and full charge states. | pass | GaugeBar cadence parity unit; BattleHud cadence parity integration; GaugeBar cadence parity stories; Gauge cadence parity |
| AC5: When `customScreenOpen` becomes `true`, glow effect stops immediately. | pass | GaugeBar customScreenOpen stop unit; BattleHud customScreenOpen integration; GaugeBar custom screen open story; Gauge stops on custom screen |
| AC6: Storybook shows off/low/mid/full states with visibly increasing amplitude. | pass | GaugeBar story state unit; Gauge story wiring integration; GaugeBar off low mid full stories; Gauge story visual smoke |
| AC7: UI tests verify 0%, partial, full, and custom-screen-open behavior. | pass | Gauge behavior matrix unit; Gauge behavior matrix integration; GaugeBar behavior story evidence; Gauge behavior matrix e2e |

## Test Evidence
- npm run lint: exit 0
- npm run type-check: exit 0
- npm run test:client: exit 0
- npm run test:e2e:card -- --grep custom-gauge-charge-weighted-breathing: exit 0

## Review Findings
- none

## Risks
- See assumptions diff and review findings.

## Rollback Notes
- Revert card branch commits and rerun orchestrator.
