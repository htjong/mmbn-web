export type PanelOwner = 'player1' | 'player2' | 'neutral';
export type PanelState = 'normal' | 'cracked' | 'broken' | 'locked';

export interface GridPanel {
  x: number;
  y: number;
  owner: PanelOwner;
  state: PanelState;
  damageCounter: number; // Ticks until state changes
}

export interface GridPosition {
  x: number;
  y: number;
}

export const GRID_WIDTH = 6;
export const GRID_HEIGHT = 3;
