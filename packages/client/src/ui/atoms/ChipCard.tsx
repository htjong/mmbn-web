import { Chip } from '@mmbn/shared';

interface ChipCardProps {
  chip: Chip;
  isFocused: boolean;
}

const ELEMENT_COLORS: Record<string, string> = {
  none: '#888',
  fire: '#e84c10',
  aqua: '#2288ff',
  elec: '#ffd700',
  wood: '#4caf50',
};

export function ChipCard({ chip, isFocused }: ChipCardProps) {
  const elementColor = ELEMENT_COLORS[chip.element] ?? '#888';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 4px',
        border: isFocused ? '2px solid #f44336' : '2px solid #444',
        borderRadius: '3px',
        backgroundColor: '#1a1a1a',
        minWidth: '80px',
      }}
    >
      <div
        style={{
          width: '12px',
          height: '12px',
          backgroundColor: elementColor,
          borderRadius: '2px',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: '#fff',
          fontSize: '10px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '60px',
        }}
      >
        {chip.name}
      </span>
    </div>
  );
}
