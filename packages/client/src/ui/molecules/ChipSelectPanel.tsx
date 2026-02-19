import { Chip } from '@mmbn/shared';
import { ChipSlot } from '../atoms/ChipSlot';

interface ChipSelectPanelProps {
  hand: Chip[];
  isActive: boolean;
  cursorIndex: number;
  selectedIndices: number[];
  okFocused: boolean;
  previewChip: Chip | null;
  onOk: () => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  none: '#888',
  fire: '#e84c10',
  aqua: '#2288ff',
  elec: '#ffd700',
  wood: '#4caf50',
};

export function ChipSelectPanel({
  hand,
  isActive,
  cursorIndex,
  selectedIndices,
  okFocused,
  previewChip,
  onOk,
}: ChipSelectPanelProps) {
  // Split hand into two rows of up to 5 each
  const row1: (Chip | null)[] = [...hand.slice(0, 5)];
  while (row1.length < 5) row1.push(null);

  const hasRow2 = hand.length > 5;
  const row2: (Chip | null)[] = hasRow2 ? [...hand.slice(5, 10)] : [];
  while (hasRow2 && row2.length < 5) row2.push(null);

  // Selected chips list (in order of selection)
  const selectedChipsList: Chip[] = selectedIndices.map((i) => hand[i]).filter(Boolean) as Chip[];

  return (
    <div
      style={{
        width: '800px',
        opacity: isActive ? 1 : 0.3,
        transition: 'opacity 0.15s ease',
        backgroundColor: '#1a0020',
        border: '2px solid #8b008b',
        boxSizing: 'border-box',
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      {/* Main area: preview left, selected stack right */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {/* Left: Preview */}
        <div
          style={{
            flex: 1,
            backgroundColor: '#0d000d',
            border: '1px solid #4a0050',
            borderRadius: '4px',
            padding: '8px',
            minHeight: '80px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {previewChip ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: ELEMENT_COLORS[previewChip.element] ?? '#888',
                    borderRadius: '3px',
                  }}
                />
                <span
                  style={{
                    color: '#fff',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                  }}
                >
                  {previewChip.name}
                </span>
              </div>
              <span style={{ color: '#aaa', fontSize: '11px', fontFamily: 'monospace' }}>
                {previewChip.element.toUpperCase()}
              </span>
              <span style={{ color: '#ffcc00', fontSize: '13px', fontFamily: 'monospace' }}>
                DMG: {previewChip.damage}
              </span>
              <span
                style={{
                  color: '#888',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  lineHeight: '1.3',
                }}
              >
                {previewChip.description}
              </span>
            </>
          ) : (
            <span style={{ color: '#555', fontSize: '12px', fontFamily: 'monospace' }}>
              No chip
            </span>
          )}
        </div>

        {/* Right: Selected chip stack */}
        <div
          style={{
            width: '100px',
            backgroundColor: '#0d000d',
            border: '1px solid #4a0050',
            borderRadius: '4px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          <span
            style={{
              color: '#888',
              fontSize: '10px',
              fontFamily: 'monospace',
              marginBottom: '2px',
            }}
          >
            SELECTED ({selectedChipsList.length}/5)
          </span>
          {Array.from({ length: 5 }).map((_, i) => {
            const chip = selectedChipsList[i];
            return (
              <div
                key={i}
                style={{
                  height: '16px',
                  backgroundColor: chip ? '#2a002a' : '#111',
                  border: '1px solid #330033',
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 4px',
                }}
              >
                {chip && (
                  <span
                    style={{
                      color: '#ddd',
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {chip.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 1: chips 0–4 */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {row1.map((chip, i) => (
          <ChipSlot
            key={i}
            chip={chip}
            isActive={isActive && chip !== null}
            isCursor={isActive && !okFocused && i === cursorIndex}
            isSelected={selectedIndices.includes(i)}
          />
        ))}
      </div>

      {/* Row 2: chips 5–9 (only if hand has 6+ chips) */}
      {hasRow2 && (
        <div style={{ display: 'flex', gap: '4px' }}>
          {row2.map((chip, i) => {
            const absoluteIndex = i + 5;
            return (
              <ChipSlot
                key={absoluteIndex}
                chip={chip}
                isActive={isActive && chip !== null}
                isCursor={isActive && !okFocused && absoluteIndex === cursorIndex}
                isSelected={selectedIndices.includes(absoluteIndex)}
              />
            );
          })}
        </div>
      )}

      {/* OK button row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={isActive ? onOk : undefined}
          disabled={!isActive}
          style={{
            padding: '6px 16px',
            backgroundColor: okFocused ? '#aa22aa' : isActive ? '#8b008b' : '#3a0040',
            color: isActive ? '#fff' : '#666',
            border: okFocused
              ? '2px solid #ffe57f'
              : isActive
                ? '2px solid #cc44cc'
                : '2px solid #440044',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: isActive ? 'pointer' : 'default',
            letterSpacing: '1px',
          }}
        >
          OK
        </button>
      </div>

      {/* Controls hint */}
      {isActive && (
        <div
          style={{ color: '#666', fontSize: '10px', fontFamily: 'monospace', textAlign: 'center' }}
        >
          WASD: navigate · K: select · J: undo · Space: focus OK · K on OK: confirm
        </div>
      )}
    </div>
  );
}
