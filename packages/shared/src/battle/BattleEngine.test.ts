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

  it('should handle navi movement with bounds checking', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Player1 starts at (0, 2), move to (0, 3)
    const { state: newState, events } = BattleEngine.applyAction(state, 'player1', {
      type: 'move',
      gridX: 0,
      gridY: 3,
    });

    expect(newState.player1.position.y).toBe(3);
    expect(events.some((e) => e.type === 'navi_moved')).toBe(true);
  });

  it('should reject movement outside grid bounds', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Try to move outside bounds
    const { state: newState } = BattleEngine.applyAction(state, 'player1', {
      type: 'move',
      gridX: -1,
      gridY: 2,
    });

    expect(newState.player1.position.x).toBe(0); // Should not move
  });

  it('should handle buster attack', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    const initialHp = state.player2.hp;
    const { state: newState, events } = BattleEngine.applyAction(state, 'player1', {
      type: 'buster',
    });

    expect(newState.player2.hp).toBe(initialHp - 10);
    expect(events.some((e) => e.type === 'buster_used')).toBe(true);
  });

  it('should keep buster available every turn', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Use buster
    const { state: state1 } = BattleEngine.applyAction(state, 'player1', {
      type: 'buster',
    });

    expect(state1.player1.busterCooldown).toBe(0); // Should be ready immediately
  });
});
