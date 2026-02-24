// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { getGaugeGlowState } from './GaugeBar';

describe('GaugeBar glow behavior', () => {
  it('custom-gauge-charge-weighted-breathing AC1: glow is inactive at 0%', () => {
    const state = getGaugeGlowState(0, 600, false);
    expect(state.active).toBe(false);
    expect(state.amplitude).toBe(0);
  });

  it('custom-gauge-charge-weighted-breathing AC2: amplitude scales by ratio during charge', () => {
    const low = getGaugeGlowState(120, 600, false);
    const mid = getGaugeGlowState(300, 600, false);

    expect(low.amplitude).toBeCloseTo(0.2, 3);
    expect(mid.amplitude).toBeCloseTo(0.5, 3);
    expect(mid.amplitude).toBeGreaterThan(low.amplitude);
  });

  it('custom-gauge-charge-weighted-breathing AC3/AC4: full charge reaches max amplitude with fixed cadence', () => {
    const mid = getGaugeGlowState(300, 600, false);
    const full = getGaugeGlowState(600, 600, false);

    expect(full.amplitude).toBe(1);
    expect(mid.cadenceMs).toBe(2000);
    expect(full.cadenceMs).toBe(2000);
  });

  it('custom-gauge-charge-weighted-breathing AC5: glow stops when custom screen opens', () => {
    const state = getGaugeGlowState(420, 600, true);
    expect(state.active).toBe(false);
    expect(state.amplitude).toBe(0);
  });
});
