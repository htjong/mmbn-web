import { createPortal } from 'react-dom';
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
    postConfirmLockActive,
    gameStartTextVisible,
    chipCursorIndex,
    chipCursorOnOk,
    customSelectedChipIndices,
    onOk,
    onRestart,
  } = useBattleHud();

  if (!player1 || !player2) return null;

  const previewChip = (!chipCursorOnOk && player1.hand[chipCursorIndex]) || null;
  const overlayRoot = document.getElementById('overlay');
  const lockOverlay =
    postConfirmLockActive && overlayRoot
      ? createPortal(
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'all',
              zIndex: 10,
            }}
          >
            <div
              style={{
                color: '#f4f4f4',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '44px',
                letterSpacing: '6px',
                opacity: gameStartTextVisible ? 1 : 0,
                transition: 'opacity 0.5s linear',
                textShadow: '0 0 10px rgba(0, 0, 0, 0.9)',
                userSelect: 'none',
              }}
            >
              GAME START
            </div>
          </div>,
          overlayRoot
        )
      : null;

  return (
    <>
      <div style={{ width: '800px', fontFamily: 'monospace' }}>
        <HudRow
          player1Hp={player1.hp}
          player1MaxHp={player1.maxHp}
          player2Hp={player2.hp}
          player2MaxHp={player2.maxHp}
          selectedChips={player1.selectedChips}
          activeChipIndex={player1.selectedChipIndex}
        />

        <GaugeBar value={gaugeValue} max={gaugeMax} customScreenOpen={customScreenOpen} />

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
      {lockOverlay}
    </>
  );
}
