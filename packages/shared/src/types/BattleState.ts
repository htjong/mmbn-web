import { Chip } from './Chip';
import { GridPanel } from './GridTypes';

export interface PlayerState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  customGauge: number;
  maxCustomGauge: number;
  hand: Chip[]; // Current chips in hand (drawn from folder)
  folder: Chip[]; // All chips in folder (deck)
  selectedChips: Chip[]; // Chips selected for current turn
  selectedChipIndex: number; // Which chip in selectedChips is active (0-2)
  position: { x: number; y: number }; // Navi position on grid (0-5 x, 0-2 y)
  isStunned: boolean;
  busterCooldown: number; // Frames until buster can be used again (0 = ready)
  buffedDamage: number; // 0-100%, damage multiplier
  debuffedDefense: number; // 0-100%, damage taken multiplier
}

export interface BattleState {
  id: string;
  frame: number;
  turnPhase: 'custom_select' | 'chip_use' | 'movement' | 'enemy_turn' | 'end';
  customSelectFrame: number; // Frames remaining for custom selection
  player1: PlayerState;
  player2: PlayerState;
  grid: GridPanel[][];
  currentTurn: 'player1' | 'player2';
  winner: 'player1' | 'player2' | null;
  battleLog: BattleEvent[];
  isGameOver: boolean;
}

export interface BattleEvent {
  frame: number;
  type:
    | 'chip_used'
    | 'buster_used'
    | 'damage_dealt'
    | 'panel_broken'
    | 'panel_owned'
    | 'chip_drawn'
    | 'navi_moved'
    | 'navi_stunned'
    | 'custom_charged'
    | 'turn_changed'
    | 'battle_end';
  playerId: string;
  data: Record<string, unknown>;
}

/**
 * Player actions during battle
 *
 * - 'move': Move navi to adjacent grid position (gridX, gridY required)
 * - 'chip_select': Select chip for custom screen (chipId required)
 * - 'chip_use': Activate selected chip (requires chip in selectedChips)
 * - 'buster': Use buster attack (no parameters required, always available)
 * - 'confirm': Confirm current action/selection
 */
export interface PlayerAction {
  type: 'move' | 'chip_select' | 'chip_use' | 'buster' | 'confirm';
  chipId?: string;
  gridX?: number;
  gridY?: number;
  timestamp?: number;
}
