- Replace the title prompt with "PRESS SPACE TO START" and make Space the only keyboard start action. This creates a clean, explicit contract between on-screen instruction and input behavior. It removes ambiguity from multiple-start keys.
- Single-key start mapping (Space only).
- Stronger UI/input consistency and clearer onboarding.

## Acceptance Criteria
- [ ] Title screen prompt text reads exactly `PRESS SPACE TO START` and no longer references Enter.
- [ ] While `gamePhase === 'menu'`, pressing Space starts the game and transitions to battle.
- [ ] While `gamePhase === 'menu'`, pressing Enter does not start the game.
- [ ] Click/tap on the title screen does not start the game.
- [ ] Holding Space does not trigger repeated start attempts (`KeyboardEvent.repeat` is ignored).
- [ ] Storybook for TitleScreen reflects the updated Space-only start prompt.
- [ ] Automated tests cover Space-start success and Enter/click/no-repeat non-start behavior.

## Chosen Direction: Strict Space Contract
**Concept:** Keep title input and prompt fully locked to Space only. This prioritizes explicitness and consistency above flexibility.
**Key Mechanic:** Only Space starts from menu; all other start inputs are ignored.
**What It Adds:** Clear onboarding with zero ambiguity.
