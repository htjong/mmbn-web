interface HpBarProps {
  name: string;
  hp: number;
  maxHp: number;
  side: 'left' | 'right';
}

function getBarColor(hp: number, maxHp: number): string {
  const ratio = hp / maxHp;
  if (ratio > 0.5) return '#4caf50';
  if (ratio > 0.25) return '#ff9800';
  return '#f44336';
}

export function HpBar({ name, hp, maxHp, side }: HpBarProps) {
  const ratio = maxHp > 0 ? Math.max(0, hp) / maxHp : 0;
  const barColor = getBarColor(hp, maxHp);
  const isRight = side === 'right';

  return (
    <div style={{ flex: 1, padding: '4px 8px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: isRight ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '2px',
        }}
      >
        {!isRight && (
          <span
            style={{
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        )}
        <span style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
          {hp}/{maxHp}
        </span>
        {isRight && (
          <span
            style={{
              color: '#fff',
              fontSize: '12px',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        )}
      </div>
      <div
        style={{
          height: '8px',
          backgroundColor: '#333',
          borderRadius: '4px',
          overflow: 'hidden',
          direction: isRight ? 'rtl' : 'ltr',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${ratio * 100}%`,
            backgroundColor: barColor,
            transition: 'width 0.1s ease',
          }}
        />
      </div>
    </div>
  );
}
