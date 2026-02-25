interface GaugeBarProps {
  value: number;
  max: number;
  customScreenOpen?: boolean;
}

export interface GaugeGlowState {
  ratio: number;
  amplitude: number;
  active: boolean;
  cadenceMs: number;
}

export function getGaugeGlowState(
  value: number,
  max: number,
  customScreenOpen: boolean
): GaugeGlowState {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const active = ratio > 0 && !customScreenOpen;
  const amplitude = active ? ratio : 0;
  return {
    ratio,
    amplitude,
    active,
    cadenceMs: 2000,
  };
}

export function GaugeBar({ value, max, customScreenOpen = false }: GaugeBarProps) {
  const glow = getGaugeGlowState(value, max, customScreenOpen);
  const ratio = glow.ratio;
  const isFull = ratio >= 1;
  const fillColor = isFull ? '#b39ddb' : '#2196f3';
  const minOpacity = 0.35;
  const maxOpacity = Math.min(1, minOpacity + glow.amplitude * 0.65);
  const brightness = 1 + glow.amplitude * 0.5;
  const pulseAnimation = glow.active
    ? `mmbn-custom-pulse ${glow.cadenceMs}ms ease-in-out infinite`
    : 'none';
  const pulseClassName = glow.active ? 'gauge-pulse-on' : 'gauge-pulse-off';

  return (
    <>
      <style>{`
        @keyframes mmbn-custom-pulse {
          0%, 100% { opacity: var(--gauge-opacity-min); filter: brightness(1); }
          50% { opacity: var(--gauge-opacity-max); filter: brightness(var(--gauge-brightness-max)); }
        }
      `}</style>
      <div
        data-testid="custom-gauge"
        data-pulse-active={glow.active ? 'true' : 'false'}
        data-pulse-amplitude={glow.amplitude.toFixed(3)}
        data-pulse-cadence-ms={String(glow.cadenceMs)}
        style={
          {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 8px',
            backgroundColor: '#0d2137',
            '--gauge-opacity-min': String(minOpacity),
            '--gauge-opacity-max': String(maxOpacity),
            '--gauge-brightness-max': String(brightness),
          } as CSSProperties
        }
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
            className={pulseClassName}
            data-testid="custom-gauge-fill"
            style={{
              height: '100%',
              width: `${ratio * 100}%`,
              backgroundColor: fillColor,
              transition: 'width 0.05s linear',
              animation: pulseAnimation,
              boxShadow: glow.active
                ? `0 0 ${4 + Math.round(glow.amplitude * 10)}px ${fillColor}`
                : 'none',
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
    </>
  );
}
import type { CSSProperties } from 'react';
