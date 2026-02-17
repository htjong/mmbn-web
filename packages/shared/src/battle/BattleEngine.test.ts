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
    expect(state.isGameOver).toBe(false);
    expect(state.grid.length).toBe(3);
    expect(state.grid[0].length).toBe(6);
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

    // Player1 starts at (1, 1), move to (2, 1)
    const { state: newState, events } = BattleEngine.applyAction(state, 'player1', {
      type: 'move',
      gridX: 2,
      gridY: 1,
    });

    expect(newState.player1.position.x).toBe(2);
    expect(events.some((e) => e.type === 'navi_moved')).toBe(true);
  });

  it('should reject movement onto opponent panels', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Move P1 to (2,1) first (own territory)
    const { state: state1 } = BattleEngine.applyAction(state, 'player1', {
      type: 'move',
      gridX: 2,
      gridY: 1,
    });
    expect(state1.player1.position.x).toBe(2);

    // Try to move P1 to (3,1) — Player 2's territory
    const { state: state2 } = BattleEngine.applyAction(state1, 'player1', {
      type: 'move',
      gridX: 3,
      gridY: 1,
    });
    expect(state2.player1.position.x).toBe(2); // Should not move
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

    // Try to move outside bounds (not adjacent to starting pos (1,1))
    const { state: newState } = BattleEngine.applyAction(state, 'player1', {
      type: 'move',
      gridX: -1,
      gridY: 1,
    });

    expect(newState.player1.position.x).toBe(1); // Should not move
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
