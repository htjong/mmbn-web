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
  position: { x: number; y: number }; // Navi position on grid
  isStunned: boolean;
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
    | 'damage_dealt'
    | 'panel_broken'
    | 'panel_owned'
    | 'chip_drawn'
    | 'battle_end'
    | 'navi_moved'
    | 'navi_stunned'
    | 'custom_charged'
    | 'turn_changed';
  playerId: string;
  data: Record<string, unknown>;
}

export interface PlayerAction {
  type: 'chip_select' | 'move' | 'attack' | 'confirm';
  chipId?: string;
  gridX?: number;
  gridY?: number;
  timestamp?: number;
}
