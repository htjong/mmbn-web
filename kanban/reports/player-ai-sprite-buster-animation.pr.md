## Summary
Implemented the player/simpleAI sprite swap with action-state animations and shared buster timing phases. Replaced placeholder rectangles with sprite textures, added deterministic animation helpers, and moved buster hit/cooldown timing into shared battle logic.

## Acceptance Criteria Trace
| AC | Status | Unit | Integration | Storybook | E2E | TDD Proof |
| --- | --- | --- | --- | --- | --- | --- |
| AC1 | pass | `naviAnimation.test.ts` | `BattleScene.ts` | `BattleStageSprites.stories.tsx` | `title-screen.spec.ts` | red/green/refactor complete |
| AC2 | pass | `naviAnimation.test.ts` | `NaviRenderer.ts` | `BattleStageSprites.stories.tsx` | `custom-gauge.spec.ts` | red/green/refactor complete |
| AC3 | pass | `naviAnimation.test.ts` | `NaviRenderer.ts` | `BattleStageSprites.stories.tsx` | `title-screen.spec.ts` | red/green/refactor complete |
| AC4 | pass | `naviAnimation.test.ts` | `BattleEngine.ts` | `BattleStageSprites.stories.tsx` | `custom-gauge.spec.ts` | red/green/refactor complete |
| AC5 | pass | `BattleEngine.test.ts` | `BattleEngine.ts` | `BattleStageSprites.stories.tsx` | `custom-gauge.spec.ts` | red/green/refactor complete |
| AC6 | pass | `BattleEngine.test.ts` | `BattleEngine.ts` | `BattleStageSprites.stories.tsx` | `custom-gauge.spec.ts` | red/green/refactor complete |
| AC7 | pass | `InputHandler.test.ts` | `InputHandler.ts` | `BattleStageSprites.stories.tsx` | `title-screen.spec.ts` | red/green/refactor complete |
| AC8 | pass | `BattleEngine.test.ts` | `SimpleAI.ts` | `BattleStageSprites.stories.tsx` | `custom-gauge.spec.ts` | red/green/refactor complete |
| AC9 | pass | `naviAnimation.test.ts` | `NaviRenderer.ts` | `BattleStageSprites.stories.tsx` | `custom-gauge.spec.ts` | red/green/refactor complete |

## Test Evidence
- `npm run lint` (pass)
- `npm run type-check` (pass)
- `npm run test:shared` (pass)
- `npm run test:client` (pass)
- `npm run test:e2e:card` (pass)

## Review Findings
- none

## Risks
- Buster timing uses shared 60fps frame conversion for 100/200/400ms semantics; if engine tick rate changes, constants must be recalibrated.

## Rollback Notes
- Revert the renderer and shared battle timing commits on `feature/player-ai-sprite-buster-animation`.
