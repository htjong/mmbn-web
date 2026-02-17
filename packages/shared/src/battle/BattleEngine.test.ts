import { describe, it, expect } from 'vitest';
import { BattleEngine } from './BattleEngine';
import { CHIPS } from '../data/chips';

describe('BattleEngine', () => {
  it('should create initial battle state', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    expect(state.id).toBeDefined();
    expect(state.frame).toBe(0);
    expect(state.player1.id).toBe('player1');
    expect(state.player2.id).toBe('player2');
    expect(state.player1.hp).toBe(200);
    expect(state.player2.hp).toBe(200);
    expect(state.currentTurn).toBe('player1');
    expect(state.isGameOver).toBe(false);
    expect(state.grid.length).toBe(6);
    expect(state.grid[0].length).toBe(3);
  });

  it('should increment frame on tick', () => {
    const chipList = Object.values(CHIPS);
    let state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    const { state: newState } = BattleEngine.tick(state);
    expect(newState.frame).toBe(1);
  });

  it('should handle chip selection action', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    const chipId = state.player1.hand[0]?.id;
    if (chipId) {
      const { state: newState, events } = BattleEngine.applyAction(state, 'player1', {
        type: 'chip_select',
        chipId,
      });

      expect(newState.player1.selectedChips.length).toBe(1);
      expect(events.some((e) => e.type === 'chip_used')).toBe(true);
    }
  });

  it('should validate game over correctly', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    expect(BattleEngine.isGameOver(state)).toBe(false);

    state.player1.hp = 0;
    expect(BattleEngine.isGameOver(state)).toBe(true);
    expect(BattleEngine.getWinner(state)).toBe('player2');
  });
});
