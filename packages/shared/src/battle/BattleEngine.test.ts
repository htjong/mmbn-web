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
    expect(state.player1.hp).toBe(100);
    expect(state.player2.hp).toBe(100);
    expect(state.isGameOver).toBe(false);
    expect(state.grid.length).toBe(3);
    expect(state.grid[0].length).toBe(6);
  });

  it('should increment frame on tick', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
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
      expect(events.some((e) => e.type === 'chip_selected')).toBe(true);
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

    expect(newState.player2.hp).toBe(initialHp - 1);
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

  it('should deal damage when using a chip', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Select a chip first
    const chipId = state.player1.hand[0]?.id;
    expect(chipId).toBeDefined();
    const { state: stateWithChip } = BattleEngine.applyAction(state, 'player1', {
      type: 'chip_select',
      chipId: chipId!,
    });
    expect(stateWithChip.player1.selectedChips.length).toBe(1);

    const initialHp = stateWithChip.player2.hp;
    const selectedChip = stateWithChip.player1.selectedChips[0];
    const expectedDamage = selectedChip.damage;

    // Use the chip
    const { state: newState, events } = BattleEngine.applyAction(stateWithChip, 'player1', {
      type: 'chip_use',
    });

    expect(newState.player2.hp).toBe(initialHp - expectedDamage);
    expect(events.some((e) => e.type === 'chip_used')).toBe(true);
  });

  it('should consume chip after use', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Select two chips
    const chip1Id = state.player1.hand[0]?.id;
    const chip2Id = state.player1.hand[1]?.id;
    let current = state;
    ({ state: current } = BattleEngine.applyAction(current, 'player1', {
      type: 'chip_select',
      chipId: chip1Id!,
    }));
    ({ state: current } = BattleEngine.applyAction(current, 'player1', {
      type: 'chip_select',
      chipId: chip2Id!,
    }));
    expect(current.player1.selectedChips.length).toBe(2);

    // Use chip — should remove it
    const { state: afterUse } = BattleEngine.applyAction(current, 'player1', {
      type: 'chip_use',
    });
    expect(afterUse.player1.selectedChips.length).toBe(1);
  });

  it('should miss buster when attacker and opponent are on different rows', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Move player1 to a different row (1,0)
    const { state: movedState } = BattleEngine.applyAction(state, 'player1', {
      type: 'move',
      gridX: 1,
      gridY: 0,
    });
    expect(movedState.player1.position.y).toBe(0);
    expect(movedState.player2.position.y).toBe(1);

    const initialHp = movedState.player2.hp;
    const { state: afterBuster, events } = BattleEngine.applyAction(movedState, 'player1', {
      type: 'buster',
    });

    expect(afterBuster.player2.hp).toBe(initialHp); // No damage
    expect(events.some((e) => e.type === 'buster_used')).toBe(false);
  });

  it('should miss chip when attacker and opponent are on different rows', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    // Select a chip
    const chipId = state.player1.hand[0]?.id;
    expect(chipId).toBeDefined();
    let current = state;
    ({ state: current } = BattleEngine.applyAction(current, 'player1', {
      type: 'chip_select',
      chipId: chipId!,
    }));

    // Move player1 to a different row
    ({ state: current } = BattleEngine.applyAction(current, 'player1', {
      type: 'move',
      gridX: 1,
      gridY: 0,
    }));

    const initialHp = current.player2.hp;
    const { state: afterChip } = BattleEngine.applyAction(current, 'player1', {
      type: 'chip_use',
    });

    expect(afterChip.player2.hp).toBe(initialHp); // No damage
    expect(afterChip.player1.selectedChips.length).toBe(0); // Chip still consumed
  });

  it('should be a no-op when using chip_use with no selected chips', () => {
    const chipList = Object.values(CHIPS);
    const state = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipList,
      'Alice',
      'Bob'
    );

    expect(state.player1.selectedChips.length).toBe(0);

    const { state: newState, events } = BattleEngine.applyAction(state, 'player1', {
      type: 'chip_use',
    });

    expect(newState.player2.hp).toBe(state.player2.hp);
    expect(events.length).toBe(0);
  });
});
