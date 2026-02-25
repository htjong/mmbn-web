import { BattleState, PlayerState, BattleEvent, PlayerAction } from '../types/BattleState.js';
import { GridPanel, GRID_WIDTH, GRID_HEIGHT } from '../types/GridTypes.js';
import { Chip } from '../types/Chip.js';
import { GridSystem } from './GridSystem.js';
import { ChipSystem } from './ChipSystem.js';

const STARTING_HP = 500;
const STARTING_CUSTOM_GAUGE_MAX = 600;
export const HAND_SIZE = 10;
const SELECTED_CHIPS_SIZE = 5;
const TARGET_FPS = 60;
const FRAME_MS = 1000 / TARGET_FPS;
const msToFrames = (ms: number): number => Math.round(ms / FRAME_MS);

export const BUSTER_FIRE_MS = 400;
export const BUSTER_LAND_DELAY_MS = 100;
export const BUSTER_COOLDOWN_MS = 200;
export const BUSTER_FIRE_FRAMES = msToFrames(BUSTER_FIRE_MS);
export const BUSTER_LAND_DELAY_FRAMES = msToFrames(BUSTER_LAND_DELAY_MS);
export const BUSTER_COOLDOWN_FRAMES = msToFrames(BUSTER_COOLDOWN_MS);
const BUSTER_DAMAGE = 10;
/**
 * Deterministic battle engine
 * Runs identically on client and server
 * Input: current state + player action
 * Output: new state + events
 */
export class BattleEngine {
  /**
   * Draw chips randomly from a folder. Intentionally NOT on the engine — randomness
   * belongs to the caller (client or server) so the engine stays deterministic.
   * Pass the results as player1Hand/player2Hand to createInitialState.
   */
  static drawChips(folder: Chip[], count: number): Chip[] {
    const drawn: Chip[] = [];
    for (let i = 0; i < count && folder.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * folder.length);
      drawn.push(ChipSystem.cloneChip(folder[randomIndex]));
    }
    return drawn;
  }

  /**
   * Create initial battle state.
   * @param player1Hand - Pre-drawn hand for player 1 (call BattleEngine.drawChips on the caller side)
   * @param player2Hand - Pre-drawn hand for player 2
   * @param battleId    - Stable ID for this battle (supply from server or caller; avoids Date.now())
   */
  static createInitialState(
    player1Id: string,
    player2Id: string,
    folder: Chip[],
    player1Name: string = 'Player 1',
    player2Name: string = 'Player 2',
    player1Hand?: Chip[],
    player2Hand?: Chip[],
    battleId?: string
  ): BattleState {
    const grid = GridSystem.createInitialGrid();
    const hand1 = player1Hand ?? this.drawChips(folder, HAND_SIZE);
    const hand2 = player2Hand ?? this.drawChips(folder, HAND_SIZE);

    const player1 = this.createPlayerState(player1Id, player1Name, grid, folder, hand1);
    const player2 = this.createPlayerState(player2Id, player2Name, grid, folder, hand2);

    const state: BattleState = {
      id: battleId ?? `battle_${player1Id}_${player2Id}`,
      frame: 0,
      player1,
      player2,
      grid,
      winner: null,
      battleLog: [],
      isGameOver: false,
    };

    return state;
  }

  private static createPlayerState(
    playerId: string,
    playerName: string,
    _grid: GridPanel[][],
    folder: Chip[],
    hand: Chip[]
  ): PlayerState {
    return {
      id: playerId,
      name: playerName,
      hp: STARTING_HP,
      maxHp: STARTING_HP,
      customGauge: 0,
      maxCustomGauge: STARTING_CUSTOM_GAUGE_MAX,
      hand: [...hand],
      folder: [...folder],
      selectedChips: [],
      selectedChipIndex: 0,
      position: { x: playerId === 'player1' ? 1 : 4, y: 1 }, // Middle of each side
      isStunned: false,
      busterCooldown: 0, // Buster available immediately
      busterPhase: 'idle',
      busterFramesRemaining: 0,
    };
  }

  static tick(state: BattleState): { state: BattleState; events: BattleEvent[] } {
    const newState = JSON.parse(JSON.stringify(state)) as BattleState;
    const events: BattleEvent[] = [];

    newState.frame += 1;

    // Fill both players' custom gauges simultaneously (real-time)
    for (const player of [newState.player1, newState.player2]) {
      if (player.customGauge < player.maxCustomGauge) {
        player.customGauge = Math.min(player.customGauge + 1, player.maxCustomGauge);
      }
    }

    const busterEvents = this.tickBusterState(newState);
    events.push(...busterEvents);

    // Check for game over
    if (newState.player1.hp <= 0 || newState.player2.hp <= 0) {
      newState.isGameOver = true;
      newState.winner = newState.player1.hp <= 0 ? 'player2' : 'player1';
      events.push({
        frame: newState.frame,
        type: 'battle_end',
        playerId: newState.winner,
        data: { winner: newState.winner },
      });
    }

    return { state: newState, events };
  }

  private static tickBusterState(state: BattleState): BattleEvent[] {
    const events: BattleEvent[] = [];
    const pairs: Array<[PlayerState, PlayerState]> = [
      [state.player1, state.player2],
      [state.player2, state.player1],
    ];

    for (const [player, opponent] of pairs) {
      if (player.busterFramesRemaining > 0) {
        player.busterFramesRemaining -= 1;
      }

      if (player.busterPhase === 'firing' && player.busterFramesRemaining === 0) {
        player.busterPhase = 'landing';
        player.busterFramesRemaining = BUSTER_LAND_DELAY_FRAMES;
        continue;
      }

      if (player.busterPhase === 'landing' && player.busterFramesRemaining === 0) {
        if (player.position.y === opponent.position.y) {
          opponent.hp = Math.max(0, opponent.hp - BUSTER_DAMAGE);
          events.push({
            frame: state.frame,
            type: 'buster_used',
            playerId: player.id,
            data: { damage: BUSTER_DAMAGE, opponentHp: opponent.hp },
          });
        }
        player.busterPhase = 'cooldown';
        player.busterCooldown = BUSTER_COOLDOWN_FRAMES;
        player.busterFramesRemaining = BUSTER_COOLDOWN_FRAMES;
        continue;
      }

      if (player.busterPhase === 'cooldown' && player.busterFramesRemaining === 0) {
        player.busterPhase = 'idle';
        player.busterCooldown = 0;
      } else if (player.busterPhase === 'cooldown') {
        player.busterCooldown = player.busterFramesRemaining;
      }
    }

    return events;
  }

  static applyAction(
    state: BattleState,
    playerId: string,
    action: PlayerAction
  ): { state: BattleState; events: BattleEvent[] } {
    const newState = JSON.parse(JSON.stringify(state)) as BattleState;
    const events: BattleEvent[] = [];

    const player = playerId === 'player1' ? newState.player1 : newState.player2;
    const opponent = playerId === 'player1' ? newState.player2 : newState.player1;

    if (action.type === 'chip_select' && action.chipId) {
      // Select a chip from hand for custom screen
      const chipIndex = player.hand.findIndex((c) => c.id === action.chipId);
      if (chipIndex >= 0) {
        // Add to selected chips if we haven't reached the limit
        if (player.selectedChips.length < SELECTED_CHIPS_SIZE) {
          player.selectedChips.push(player.hand[chipIndex]);
          events.push({
            frame: newState.frame,
            type: 'chip_selected',
            playerId,
            data: { chipId: action.chipId },
          });
        }
      }
    } else if (action.type === 'move' && action.gridX !== undefined && action.gridY !== undefined) {
      // Move navi on grid
      const newX = action.gridX;
      const newY = action.gridY;

      // Validate move: adjacent, within bounds, and on own panels
      const distance = Math.abs(newX - player.position.x) + Math.abs(newY - player.position.y);
      const isInBounds = newX >= 0 && newX < GRID_WIDTH && newY >= 0 && newY < GRID_HEIGHT;
      const playerSide = playerId === 'player1' ? 'player1' : 'player2';
      const targetPanelOwned = isInBounds && newState.grid[newY][newX].owner === playerSide;

      if (distance === 1 && isInBounds && targetPanelOwned) {
        player.position.x = newX;
        player.position.y = newY;
        events.push({
          frame: newState.frame,
          type: 'navi_moved',
          playerId,
          data: { x: newX, y: newY },
        });
      }
    } else if (action.type === 'buster') {
      // Buster now resolves with a timed firing -> landing -> cooldown sequence.
      if (player.busterPhase === 'idle' && player.busterCooldown === 0) {
        player.busterPhase = 'firing';
        player.busterFramesRemaining = BUSTER_FIRE_FRAMES;
      }
    } else if (action.type === 'chip_use') {
      const chip = player.selectedChips[player.selectedChipIndex];
      // Chips fire horizontally — must be on same row to hit
      if (chip && player.position.y === opponent.position.y) {
        const damage = ChipSystem.calculateDamage(chip, 'none');
        opponent.hp = Math.max(0, opponent.hp - damage);

        // Remove used chip from selectedChips
        player.selectedChips.splice(player.selectedChipIndex, 1);
        // Clamp index if it's now out of bounds
        if (player.selectedChipIndex >= player.selectedChips.length) {
          player.selectedChipIndex = Math.max(0, player.selectedChips.length - 1);
        }

        events.push({
          frame: newState.frame,
          type: 'chip_used',
          playerId,
          data: { chipId: chip.id, damage, opponentHp: opponent.hp },
        });
      } else if (chip) {
        // Chip missed — still consume it
        player.selectedChips.splice(player.selectedChipIndex, 1);
        if (player.selectedChipIndex >= player.selectedChips.length) {
          player.selectedChipIndex = Math.max(0, player.selectedChips.length - 1);
        }
      }
    }

    return { state: newState, events };
  }

  static isGameOver(state: BattleState): boolean {
    return state.player1.hp <= 0 || state.player2.hp <= 0;
  }

  static getWinner(state: BattleState): 'player1' | 'player2' | null {
    if (state.player1.hp <= 0) return 'player2';
    if (state.player2.hp <= 0) return 'player1';
    return null;
  }
}
