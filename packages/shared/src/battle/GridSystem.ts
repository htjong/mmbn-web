import { GridPanel, GRID_WIDTH, GRID_HEIGHT } from '../types/GridTypes.js';

/**
 * 6x3 grid logic (6 columns, 3 rows)
 * Grid layout:
 *   OOOXXX
 *   O1OX2X
 *   OOOXXX
 * Player 1 controls left 3 columns (x=0,1,2)
 * Player 2 controls right 3 columns (x=3,4,5)
 * Player 1 starts at (1,1), Player 2 starts at (4,1)
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
          owner: x < 3 ? 'player1' : 'player2',
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
