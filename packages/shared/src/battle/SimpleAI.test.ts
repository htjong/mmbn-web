import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BattleEngine } from './BattleEngine';
import { SimpleAI } from './SimpleAI';
import { CHIPS } from '../data/chips';

describe('SimpleAI', () => {
  const chipList = Object.values(CHIPS);
  let ai: SimpleAI;

  beforeEach(() => {
    ai = new SimpleAI();
  });

  it('should return null during move cooldown for movement', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;
    // Put them on different rows so AI won't buster
    state.player2.position = { x: 4, y: 0 };
    state.player1.position = { x: 1, y: 2 };

    const first = ai.getNextAction('player2', state);
    expect(first).not.toBeNull();
    expect(first!.type).toBe('move');

    // Immediately after, move cooldown is active — should return null
    const second = ai.getNextAction('player2', state);
    expect(second).toBeNull();
  });

  it('should allow attack even when move cooldown is active', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;
    // Same row so buster can fire
    state.player2.position = { x: 4, y: 1 };
    state.player1.position = { x: 1, y: 1 };

    // First action: could be buster (same row) — force move cooldown by getting a move first
    // Move player2 to different row first to get a move action
    state.player2.position = { x: 4, y: 0 };
    state.player1.position = { x: 1, y: 2 };

    const moveAction = ai.getNextAction('player2', state);
    expect(moveAction).not.toBeNull();
    expect(moveAction!.type).toBe('move');

    // Now put them on same row — attack cooldown is still 0, should buster
    state.player2.position = { x: 4, y: 1 };
    state.player1.position = { x: 1, y: 1 };

    const attackAction = ai.getNextAction('player2', state);
    expect(attackAction).not.toBeNull();
    expect(attackAction!.type).toBe('buster');
  });

  it('should return chip_use when chips are selected', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');

    // Select a chip for player2
    const chipId = state.player2.hand[0]?.id;
    expect(chipId).toBeDefined();
    const { state: withChip } = BattleEngine.applyAction(state, 'player2', {
      type: 'chip_select',
      chipId: chipId!,
    });

    const action = ai.getNextAction('player2', withChip);
    expect(action).toEqual({ type: 'chip_use' });
  });

  it('should select multiple chips when gauge is full', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.customGauge = state.player2.maxCustomGauge;
    // Ensure enough chips in hand
    expect(state.player2.hand.length).toBeGreaterThanOrEqual(3);

    // Should select chips on consecutive calls without cooldown
    const action1 = ai.getNextAction('player2', state);
    expect(action1?.type).toBe('chip_select');

    const action2 = ai.getNextAction('player2', state);
    expect(action2?.type).toBe('chip_select');

    const action3 = ai.getNextAction('player2', state);
    expect(action3?.type).toBe('chip_select');

    // After 3 selects, should stop selecting
    // (gauge is still full in our state, but internal counter reached max)
    const action4 = ai.getNextAction('player2', state);
    expect(action4?.type).not.toBe('chip_select');
  });

  it('should only buster when on same row as opponent', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;

    // Different rows — should never buster
    state.player2.position = { x: 4, y: 0 };
    state.player1.position = { x: 1, y: 2 };

    for (let i = 0; i < 100; i++) {
      const freshAI = new SimpleAI();
      const action = freshAI.getNextAction('player2', state);
      if (action) {
        expect(action.type).not.toBe('buster');
      }
    }
  });

  it('should buster when on same row as opponent', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;

    // Same row
    state.player2.position = { x: 4, y: 1 };
    state.player1.position = { x: 1, y: 1 };

    const action = ai.getNextAction('player2', state);
    // First call: attack cooldown is 0, same row → should buster
    expect(action).toEqual({ type: 'buster' });
  });

  it('should bias movement toward opponent row when not aligned', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;

    // AI at row 0, opponent at row 2
    state.player2.position = { x: 4, y: 0 };
    state.player1.position = { x: 1, y: 2 };

    let movedTowardCount = 0;
    const trials = 200;

    for (let i = 0; i < trials; i++) {
      const freshAI = new SimpleAI();
      const action = freshAI.getNextAction('player2', state);
      if (action && action.type === 'move' && action.gridY !== undefined) {
        if (action.gridY > 0) {
          // Moving toward row 2 (down)
          movedTowardCount++;
        }
      }
    }

    // Should be biased toward opponent (70% target, accounting for randomness)
    // Expect at least 50% of all trials move toward opponent
    expect(movedTowardCount / trials).toBeGreaterThan(0.5);
  });

  it('should return valid movement targets within player2 territory', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;
    // Different rows so it moves instead of bustering
    state.player2.position = { x: 4, y: 0 };
    state.player1.position = { x: 1, y: 2 };

    // Mock random to force a move toward opponent row
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.3)  // < 0.7 → move toward opponent
      .mockReturnValueOnce(0.0); // pick first valid direction

    const action = ai.getNextAction('player2', state);
    expect(action).not.toBeNull();
    expect(action!.type).toBe('move');

    // Player2 moves within cols 3-5, rows 0-2
    expect(action!.gridX).toBeGreaterThanOrEqual(3);
    expect(action!.gridX).toBeLessThanOrEqual(5);
    expect(action!.gridY).toBeGreaterThanOrEqual(0);
    expect(action!.gridY).toBeLessThanOrEqual(2);

    vi.restoreAllMocks();
  });

  it('should never return structurally invalid actions', () => {
    const state = BattleEngine.createInitialState('player1', 'player2', chipList, 'P1', 'P2');
    state.player2.hand = [];
    state.player2.customGauge = 0;

    const validTypes = new Set(['move', 'chip_select', 'chip_use', 'buster', 'confirm']);

    for (let i = 0; i < 200; i++) {
      const freshAI = new SimpleAI();
      const action = freshAI.getNextAction('player2', state);
      if (action) {
        expect(validTypes.has(action.type)).toBe(true);
        if (action.type === 'move') {
          expect(action.gridX).toBeDefined();
          expect(action.gridY).toBeDefined();
        }
      }
    }
  });
});
