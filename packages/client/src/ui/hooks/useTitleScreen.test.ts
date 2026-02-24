// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  START_DEBOUNCE_MS,
  canStartWithDebounce,
  getStartPrompt,
  isSpaceStartKey,
} from './useTitleScreen';

describe('useTitleScreen helpers', () => {
  it('returns modality-specific start prompt text', () => {
    expect(getStartPrompt('keyboard')).toBe('PRESS SPACE TO START');
    expect(getStartPrompt('pointer')).toBe('TAP TO START');
  });

  it('accepts Space key variants and rejects Enter', () => {
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter' });
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', code: 'Space' });

    expect(isSpaceStartKey(enterEvent)).toBe(false);
    expect(isSpaceStartKey(spaceEvent)).toBe(true);
  });

  it('applies 250ms debounce threshold', () => {
    expect(canStartWithDebounce(null, 1000)).toBe(true);
    expect(canStartWithDebounce(1000, 1200, START_DEBOUNCE_MS)).toBe(false);
    expect(canStartWithDebounce(1000, 1250, START_DEBOUNCE_MS)).toBe(true);
  });
});
