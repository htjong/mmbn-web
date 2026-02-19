import { Chip } from '@mmbn/shared';
import { HpBar } from '../atoms/HpBar';
import { ChipCard } from '../atoms/ChipCard';

interface HudRowProps {
  player1Hp: number;
  player1MaxHp: number;
  player2Hp: number;
  player2MaxHp: number;
  selectedChips: Chip[];
  activeChipIndex: number;
}

export function HudRow({
  player1Hp,
  player1MaxHp,
  player2Hp,
  player2MaxHp,
  selectedChips,
  activeChipIndex,
}: HudRowProps) {
  return (
    <div
      style={{
        width: '800px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1a0d00',
        borderTop: '2px solid #8b4513',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: Player 1 HP */}
      <HpBar name="P1" hp={player1Hp} maxHp={player1MaxHp} side="left" />

      {/* Center divider */}
      <div style={{ width: '1px', height: '32px', backgroundColor: '#8b4513' }} />

      {/* Right: Chip stack + Player 2 HP */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px',
          padding: '0 8px',
        }}
      >
        {selectedChips.map((chip, i) => (
          <ChipCard key={`${chip.id}-${i}`} chip={chip} isFocused={i === activeChipIndex} />
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '32px', backgroundColor: '#8b4513' }} />

      {/* Player 2 HP */}
      <HpBar name="P2" hp={player2Hp} maxHp={player2MaxHp} side="right" />
    </div>
  );
}
