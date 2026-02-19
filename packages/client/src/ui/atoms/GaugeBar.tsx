interface GaugeBarProps {
  value: number;
  max: number;
}

export function GaugeBar({ value, max }: GaugeBarProps) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const isFull = value >= max;
  const fillColor = isFull ? '#b39ddb' : '#2196f3';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        backgroundColor: '#0d2137',
      }}
    >
      <span
        style={{
          color: isFull ? '#b39ddb' : '#90caf9',
          fontSize: '12px',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          minWidth: '70px',
        }}
      >
        ·CUSTOM·
      </span>
      <div
        style={{
          flex: 1,
          height: '10px',
          backgroundColor: '#0a1929',
          borderRadius: '5px',
          overflow: 'hidden',
          border: '1px solid #1a3a5c',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${ratio * 100}%`,
            backgroundColor: fillColor,
            transition: 'width 0.05s linear',
          }}
        />
      </div>
      <span
        style={{
          color: '#90caf9',
          fontSize: '11px',
          fontFamily: 'monospace',
          minWidth: '30px',
          textAlign: 'right',
        }}
      >
        {Math.floor(ratio * 100)}%
      </span>
    </div>
  );
}
