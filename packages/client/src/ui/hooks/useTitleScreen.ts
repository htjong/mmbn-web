import { useEffect, useMemo, useRef, useState } from 'react';
import { useBattleStore } from '../../stores/battleStore';

export type InputModality = 'keyboard' | 'pointer';

export const START_DEBOUNCE_MS = 250;

export function getStartPrompt(modality: InputModality): string {
  return modality === 'keyboard' ? 'PRESS SPACE TO START' : 'TAP TO START';
}

export function isSpaceStartKey(event: KeyboardEvent): boolean {
  return event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar';
}

export function canStartWithDebounce(
  lastStartedAt: number | null,
  now: number,
  debounceMs = START_DEBOUNCE_MS
): boolean {
  if (lastStartedAt === null) return true;
  return now - lastStartedAt >= debounceMs;
}

export function useTitleScreen(initialModality: InputModality = 'keyboard') {
  const gamePhase = useBattleStore((s) => s.gamePhase);
  const [lastInputModality, setLastInputModality] = useState<InputModality>(initialModality);
  const lastStartedAtRef = useRef<number | null>(null);

  const promptText = useMemo(() => getStartPrompt(lastInputModality), [lastInputModality]);

  useEffect(() => {
    if (gamePhase !== 'menu') return;

    const startIfAllowed = () => {
      const now = Date.now();
      if (!canStartWithDebounce(lastStartedAtRef.current, now)) return;
      lastStartedAtRef.current = now;
      useBattleStore.getState().startGame();
    };

    const handleKey = (e: KeyboardEvent) => {
      setLastInputModality('keyboard');
      if (e.repeat) return;
      if (!isSpaceStartKey(e)) return;
      e.preventDefault();
      startIfAllowed();
    };
    const handlePointerDown = () => {
      setLastInputModality('pointer');
      startIfAllowed();
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [gamePhase]);

  return { gamePhase, lastInputModality, promptText };
}
