import { BattleState, PlayerState, BattleEvent, PlayerAction } from '../types/BattleState';
import { GridPanel, GRID_WIDTH, GRID_HEIGHT } from '../types/GridTypes';
import { Chip } from '../types/Chip';
import { GridSystem } from './GridSystem';
import { ChipSystem } from './ChipSystem';

const STARTING_HP = 200;
const STARTING_CUSTOM_GAUGE_MAX = 100;
const HAND_SIZE = 5;
const SELECTED_CHIPS_SIZE = 3;
/**
 * Deterministic battle engine
 * Runs identically on client and server
 * Input: current state + player action
 * Output: new state + events
 */
export class BattleEngine {
  static createInitialState(
    player1Id: string,
    player2Id: string,
    folder: Chip[],
    player1Name: string = 'Player 1',
    player2Name: string = 'Player 2'
  ): BattleState {
    const grid = GridSystem.createInitialGrid();

    // Create initial player states
    const player1 = this.createPlayerState(player1Id, player1Name, grid, folder);
    const player2 = this.createPlayerState(player2Id, player2Name, grid, folder);

    const state: BattleState = {
      id: `battle_${player1Id}_${player2Id}_${Date.now()}`,
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
    folder: Chip[]
  ): PlayerState {
    const hand = this.drawChips(folder, HAND_SIZE);

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
      buffedDamage: 0,
      debuffedDefense: 0,
    };
  }

  private static drawChips(folder: Chip[], count: number): Chip[] {
    const drawn: Chip[] = [];
    for (let i = 0; i < count && folder.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * folder.length);
      drawn.push(ChipSystem.cloneChip(folder[randomIndex]));
    }
    return drawn;
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
            type: 'chip_used',
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
      const distance =
        Math.abs(newX - player.position.x) + Math.abs(newY - player.position.y);
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
      // Use buster attack (basic attack, always available)
      if (player.busterCooldown === 0) {
        const busterDamage = 10;
        opponent.hp = Math.max(0, opponent.hp - busterDamage);

        events.push({
          frame: newState.frame,
          type: 'buster_used',
          playerId,
          data: { damage: busterDamage, opponentHp: opponent.hp },
        });

        // Set buster cooldown (available every turn, so no actual cooldown)
        player.busterCooldown = 0;
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
