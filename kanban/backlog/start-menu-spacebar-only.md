# Implement Context-Aware Start Prompt with Space-First Menu Start

## Mode
- Tier: T2
- Formalization: Full
- Tier-Reason: User-selected strict Full review because input contract now varies by modality and introduces explicit debounce guards.

## Description
Update title-screen start behavior so keyboard users start with Space while touch users can start via tap. Prompt copy must match detected input modality: keyboard shows `PRESS SPACE TO START`, touch shows `TAP TO START`. Enter must not start the game in menu phase. Start activation must be protected by both repeat-ignore and a short debounce window to prevent accidental re-triggering.

## Acceptance Criteria
- [ ] When last input modality is keyboard and `gamePhase === 'menu'`, prompt text is exactly `PRESS SPACE TO START`.
- [ ] When last input modality is touch/pointer and `gamePhase === 'menu'`, prompt text is exactly `TAP TO START`.
- [ ] While `gamePhase === 'menu'`, pressing Space starts the game.
- [ ] While `gamePhase === 'menu'`, pressing Enter does not start the game.
- [ ] While `gamePhase === 'menu'`, tap/click start is allowed only for touch/pointer modality.
- [ ] Start handler ignores `KeyboardEvent.repeat` and applies a 250ms debounce guard for repeated triggers.
- [ ] Storybook for `TitleScreen` includes keyboard and touch modality variants with correct prompt text.
- [ ] Automated tests cover: Space-start success, Enter non-start, modality-specific tap behavior, repeat-ignore, and debounce guard.

## Notes
- Key files: `packages/client/src/ui/organisms/TitleScreen.tsx`, `packages/client/src/ui/hooks/useTitleScreen.ts`, `packages/client/src/ui/organisms/TitleScreen.stories.tsx`, `packages/client/src/stores/battleStore.test.ts`
- Reuse: keep using `useBattleStore.getState().startGame()` as the sole transition entrypoint.
- Risks: modality detection drift can show wrong prompt copy; debounce timing that is too high may feel unresponsive.

## Architecture Review
- Determinism:
  - Status: GREEN
  - Evidence: Changes are UI/input side only; no shared simulation logic is modified.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- State impact:
  - Status: YELLOW
  - Evidence: May require UI-local tracking of last input modality and debounce timestamp.
  - Risk: introducing redundant or stale UI state can desync prompt and behavior.
  - Mitigation: derive modality from existing input handlers and keep a single source of truth.
  - Blocking: no
- Network/schema:
  - Status: GREEN
  - Evidence: No protocol events, payloads, or schema contracts are changed.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Grid/panel:
  - Status: GREEN
  - Evidence: No battlefield panel logic is touched.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Chip system:
  - Status: GREEN
  - Evidence: No chip type/effect/data behavior is changed.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Client rendering/UI:
  - Status: YELLOW
  - Evidence: Prompt copy now depends on modality and input event source.
  - Risk: inconsistent prompt text across keyboard/pointer transitions.
  - Mitigation: centralize modality resolution in title-screen hook and cover with tests/stories.
  - Blocking: no
- Reuse opportunities:
  - Status: GREEN
  - Evidence: Existing `startGame` action and `gamePhase` gating path are reusable.
  - Risk: none
  - Mitigation: none
  - Blocking: no
- Risk/order:
  - Status: GREEN
  - Evidence: Limited scope to title-screen UI and input handling.
  - Risk: low
  - Mitigation: implement in order: modality prompt, start guards, tests/stories.
  - Blocking: no
