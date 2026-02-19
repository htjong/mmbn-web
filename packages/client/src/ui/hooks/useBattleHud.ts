import { useEffect } from 'react';
import { useBattleStore } from '../../stores/battleStore';

export function useBattleHud() {
  const store = useBattleStore();
  const state = store.battleState;
  const { customScreenOpen } = store;

  // Keyboard handling for chip select — only active when custom screen is open.
  // Handler reads fresh store state at event time (no stale closure on cursor or OK state).
  useEffect(() => {
    if (!customScreenOpen) return;

    const handler = (e: KeyboardEvent) => {
      const {
        chipCursorOnOk,
        moveCursorLeft,
        moveCursorRight,
        moveCursorUp,
        moveCursorDown,
        focusOk,
        returnToChipFromOk,
        selectCurrentChip,
        rejectLastChip,
        confirmChips,
      } = useBattleStore.getState();

      if (e.key === 'a' || e.key === 'ArrowLeft') {
        e.preventDefault();
        chipCursorOnOk ? returnToChipFromOk() : moveCursorLeft();
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (!chipCursorOnOk) moveCursorRight();
      }
      if (e.key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!chipCursorOnOk) moveCursorUp();
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!chipCursorOnOk) moveCursorDown();
      }
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        chipCursorOnOk ? confirmChips() : selectCurrentChip();
      }
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        rejectLastChip();
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (!chipCursorOnOk) focusOk();
      }
      // Enter: disabled
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [customScreenOpen]); // Re-attach only when screen opens/closes

  return {
    // Battle data
    player1: state?.player1 ?? null,
    player2: state?.player2 ?? null,
    isGameOver: state?.isGameOver ?? false,
    winner: state?.winner ?? null,

    // Gauge
    gaugeValue: state?.player1.customGauge ?? 0,
    gaugeMax: state?.player1.maxCustomGauge ?? 600,

    // Custom screen state
    customScreenOpen,
    chipCursorIndex: store.chipCursorIndex,
    chipCursorOnOk: store.chipCursorOnOk,
    customSelectedChipIndices: store.customSelectedChipIndices,

    // Handlers
    onOk: store.confirmChips,
    onRestart: () => window.location.reload(),
  };
}
