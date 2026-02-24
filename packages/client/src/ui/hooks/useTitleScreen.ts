import { useEffect } from 'react';
import { useBattleStore } from '../../stores/battleStore';

export function useTitleScreen() {
  const gamePhase = useBattleStore((s) => s.gamePhase);

  useEffect(() => {
    if (gamePhase !== 'menu') return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') useBattleStore.getState().startGame();
    };
    const handleClick = () => useBattleStore.getState().startGame();

    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [gamePhase]);

  return { gamePhase };
}
