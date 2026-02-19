import { HudRow } from '../molecules/HudRow';
import { GaugeBar } from '../atoms/GaugeBar';
import { ChipSelectPanel } from '../molecules/ChipSelectPanel';
import { GameOverOverlay } from '../atoms/GameOverOverlay';
import { useBattleHud } from '../hooks/useBattleHud';

export function BattleHud() {
  const {
    player1,
    player2,
    isGameOver,
    winner,
    gaugeValue,
    gaugeMax,
    customScreenOpen,
    chipCursorIndex,
    chipCursorOnOk,
    customSelectedChipIndices,
    onOk,
    onRestart,
  } = useBattleHud();

  if (!player1 || !player2) return null;

  const previewChip = (!chipCursorOnOk && player1.hand[chipCursorIndex]) || null;

  return (
    <div style={{ width: '800px', fontFamily: 'monospace' }}>
      <HudRow
        player1Hp={player1.hp}
        player1MaxHp={player1.maxHp}
        player2Hp={player2.hp}
        player2MaxHp={player2.maxHp}
        selectedChips={player1.selectedChips}
        activeChipIndex={player1.selectedChipIndex}
      />

      <GaugeBar value={gaugeValue} max={gaugeMax} />

      <ChipSelectPanel
        hand={player1.hand}
        isActive={customScreenOpen}
        cursorIndex={chipCursorIndex}
        selectedIndices={customSelectedChipIndices}
        okFocused={chipCursorOnOk}
        previewChip={previewChip}
        onOk={onOk}
      />

      {isGameOver && <GameOverOverlay winner={winner} onRestart={onRestart} />}
    </div>
  );
}
