# Switch Title Screen Start Input to Spacebar Only

## Origin
> Copied from `kanban/ideas/start-menu-spacebar-only.md` (now deleted)

Change start menu prompt from "PRESS ENTER TO START" to "PRESS SPACE TO START" and use Space as the start key.

## Chosen Direction: Spacebar-Only Start
**Concept:** Replace the title prompt with "PRESS SPACE TO START" and make Space the only keyboard start action. This creates a clean, explicit contract between on-screen instruction and input behavior. It removes ambiguity from multiple-start keys.
**Key Mechanic:** Single-key start mapping (Space only).
**What It Adds:** Stronger UI/input consistency and clearer onboarding.

## Description
Update the title screen onboarding contract so the displayed prompt and actual keyboard behavior are fully aligned around Spacebar. Starting from menu phase should only be possible via Space on keyboard, with Enter intentionally ignored and click/tap start removed. Space input should ignore key-repeat to prevent accidental multi-trigger behavior while transitioning out of menu.

## Acceptance Criteria
- [ ] Title screen prompt text reads exactly `PRESS SPACE TO START` and no longer references Enter.
- [ ] While `gamePhase === 'menu'`, pressing Space starts the game and transitions to battle.
- [ ] While `gamePhase === 'menu'`, pressing Enter does not start the game.
- [ ] Click/tap on the title screen does not start the game.
- [ ] Holding Space does not trigger repeated start attempts (`KeyboardEvent.repeat` is ignored).
- [ ] Storybook for TitleScreen reflects the updated Space-only start prompt.
- [ ] Automated tests cover Space-start success and Enter/click/no-repeat non-start behavior.

## Notes
- Key files: `packages/client/src/ui/organisms/TitleScreen.tsx`, `packages/client/src/ui/hooks/useTitleScreen.ts`, `packages/client/src/ui/organisms/TitleScreen.stories.tsx`, `packages/client/src/stores/battleStore.test.ts`
- Reuse: `useBattleStore.getState().startGame()` as the single start transition entrypoint.
- Risks: Spacebar is used in battle/custom-screen controls; ensure Space-only start binding is active only during menu phase.

## Architecture Review
- Determinism in shared battle logic: no impact (client UI/input only).
- State impact on `BattleState` / `PlayerState`: no schema/state shape change.
- Network message/schema impact: none.
- Grid/panel rule impact: none.
- Chip-system type/effect impact: none.
- Client rendering/UI impact: title prompt content and title-screen input handler behavior change.
- Existing code reuse opportunities: retain `startGame` action in battle store; scope logic to existing `gamePhase` guard.
- Risk and implementation order: low risk; update prompt + key handler first, then remove click start path, then add/update tests and Storybook.
