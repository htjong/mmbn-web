import { Chip } from '@mmbn/shared';

interface ChipSlotProps {
  chip: Chip | null;
  isActive: boolean;
  isCursor: boolean;
  isSelected: boolean;
}

const ELEMENT_COLORS: Record<string, string> = {
  none: '#888',
  fire: '#e84c10',
  aqua: '#2288ff',
  elec: '#ffd700',
  wood: '#4caf50',
};

export function ChipSlot({ chip, isActive, isCursor, isSelected }: ChipSlotProps) {
  const elementColor = chip ? (ELEMENT_COLORS[chip.element] ?? '#888') : '#444';

  return (
    <div
      style={{
        position: 'relative',
        width: '80px',
        padding: '4px',
        border: isCursor ? '2px solid #fff' : '2px solid #444',
        borderRadius: '4px',
        backgroundColor: '#1a1a1a',
        opacity: isActive ? 1 : 0.3,
        cursor: isActive ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        minHeight: '60px',
        boxSizing: 'border-box',
      }}
    >
      {/* Element color square */}
      <div
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: elementColor,
          borderRadius: '3px',
          flexShrink: 0,
        }}
      />

      {/* Chip name */}
      <span
        style={{
          color: '#fff',
          fontSize: '9px',
          fontFamily: 'monospace',
          textAlign: 'center',
          lineHeight: '1.1',
          wordBreak: 'break-word',
          width: '100%',
        }}
      >
        {chip ? chip.name : '—'}
      </span>

      {/* Damage */}
      {chip && (
        <span
          style={{
            color: '#ffcc00',
            fontSize: '10px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          {chip.damage}
        </span>
      )}

      {/* Selected checkmark badge */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '14px',
            height: '14px',
            backgroundColor: '#4caf50',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            color: '#fff',
            fontWeight: 'bold',
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}
