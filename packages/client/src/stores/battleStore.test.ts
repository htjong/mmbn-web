// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BattleEngine, CHIPS } from '@mmbn/shared';
import { useBattleStore } from './battleStore';

function makeInitialState() {
  const chipFolder = Object.values(CHIPS);
  return BattleEngine.createInitialState('player1', 'player2', chipFolder, 'P1', 'P2');
}

function resetStore() {
  useBattleStore.getState().endPostConfirmLock();
  useBattleStore.setState({
    gamePhase: 'menu',
    battleState: null,
    customScreenOpen: false,
    postConfirmLockActive: false,
    gameStartTextVisible: false,
    chipCursorIndex: 0,
    chipCursorOnOk: false,
    customSelectedChipIndices: [],
  });
}

describe('battleStore post-confirm lock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
  });

  afterEach(() => {
    useBattleStore.getState().endPostConfirmLock();
    vi.useRealTimers();
    resetStore();
  });

  it('should start post-confirm lock and transition visibility over 2 seconds', () => {
    const store = useBattleStore.getState();
    store.init(makeInitialState());
    store.openCustomScreen();
    useBattleStore.setState({ customSelectedChipIndices: [0, 1] });

    store.confirmChips();

    expect(useBattleStore.getState().customScreenOpen).toBe(false);
    expect(useBattleStore.getState().postConfirmLockActive).toBe(true);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(useBattleStore.getState().postConfirmLockActive).toBe(true);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(useBattleStore.getState().postConfirmLockActive).toBe(false);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(false);
  });

  it('should select AI chips during confirm so both sides are confirmed', () => {
    const store = useBattleStore.getState();
    store.init(makeInitialState());
    store.openCustomScreen();
    useBattleStore.setState({ customSelectedChipIndices: [0, 1, 2] });

    store.confirmChips();

    const nextState = useBattleStore.getState().battleState!;
    expect(nextState.player1.selectedChips.length).toBe(3);
    expect(nextState.player2.selectedChips.length).toBe(3);
  });

  it('should reset timer cycle if post-confirm lock starts again', () => {
    const store = useBattleStore.getState();
    store.startPostConfirmLock();

    vi.advanceTimersByTime(1000);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(true);

    store.startPostConfirmLock();
    expect(useBattleStore.getState().postConfirmLockActive).toBe(true);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(true);
    expect(useBattleStore.getState().postConfirmLockActive).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(useBattleStore.getState().postConfirmLockActive).toBe(false);
    expect(useBattleStore.getState().gameStartTextVisible).toBe(false);
  });
});
