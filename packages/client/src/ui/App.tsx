import { useBattleStore } from '../stores/battleStore';
import { TitleScreen } from './organisms/TitleScreen';
import { BattleHud } from './organisms/BattleHud';

export function App() {
  const gamePhase = useBattleStore((s) => s.gamePhase);

  if (gamePhase === 'menu') {
    return <TitleScreen />;
  }

  return <BattleHud />;
}
