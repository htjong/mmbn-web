import { GridPanel, GRID_WIDTH, GRID_HEIGHT } from '../types/GridTypes';

/**
 * 6x3 grid logic (6 rows, 3 columns)
 * Player 1 controls left column (x=0)
 * Player 2 controls right column (x=2)
 */
export class GridSystem {
  static createInitialGrid(): GridPanel[][] {
    const grid: GridPanel[][] = [];

    for (let y = 0; y < GRID_HEIGHT; y++) {
      grid[y] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        grid[y][x] = {
          x,
          y,
          owner: x === 0 ? 'player1' : x === 2 ? 'player2' : 'neutral',
          state: 'normal',
          damageCounter: 0,
        };
      }
    }

    return grid;
  }

  static breakPanel(grid: GridPanel[][], x: number, y: number): void {
    if (!this.isValidPosition(x, y)) return;
    grid[y][x].state = 'broken';
    grid[y][x].damageCounter = 0;
  }

  static damagePanel(grid: GridPanel[][], x: number, y: number): void {
    if (!this.isValidPosition(x, y)) return;
    const panel = grid[y][x];

    if (panel.state === 'normal') {
      panel.state = 'cracked';
      panel.damageCounter = 3; // Ticks until broken
    } else if (panel.state === 'cracked') {
      this.breakPanel(grid, x, y);
    }
  }

  static restorePanel(grid: GridPanel[][], x: number, y: number): void {
    if (!this.isValidPosition(x, y)) return;
    grid[y][x].state = 'normal';
    grid[y][x].damageCounter = 0;
  }

  static setOwner(grid: GridPanel[][], x: number, y: number, owner: 'player1' | 'player2' | 'neutral'): void {
    if (!this.isValidPosition(x, y)) return;
    grid[y][x].owner = owner;
  }

  static isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
  }

  static getPanelsByOwner(grid: GridPanel[][], owner: 'player1' | 'player2'): GridPanel[] {
    return grid.flat().filter((panel) => panel.owner === owner);
  }
}
