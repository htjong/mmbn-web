import Phaser from 'phaser';
import { GridPanel, GRID_WIDTH, GRID_HEIGHT } from '@mmbn/shared';

const COLORS = {
  player1: 0x3366ff,
  player2: 0xff3333,
  neutral: 0x666666,
  broken: 0x333333,
  cracked: 0x999999,
};

export class GridRenderer {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private panelSize: number;
  private panels: Phaser.GameObjects.Rectangle[][] = [];
  private panelText: Phaser.GameObjects.Text[][] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, panelSize: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.panelSize = panelSize;
    this.createPanels();
  }

  private createPanels() {
    for (let row = 0; row < GRID_HEIGHT; row++) {
      this.panels[row] = [];
      this.panelText[row] = [];

      for (let col = 0; col < GRID_WIDTH; col++) {
        const panelX = this.x + col * this.panelSize + this.panelSize / 2;
        const panelY = this.y + row * this.panelSize + this.panelSize / 2;

        // Create rectangle for panel
        const rect = this.scene.add.rectangle(
          panelX,
          panelY,
          this.panelSize - 2,
          this.panelSize - 2
        );
        rect.setStrokeStyle(2, 0xcccccc);
        this.panels[row][col] = rect;

        // Create position label
        const text = this.scene.add.text(panelX, panelY, `${col},${row}`, {
          fontSize: '10px',
          color: '#aaaaaa',
        });
        text.setOrigin(0.5);
        this.panelText[row][col] = text;
      }
    }
  }

  update(grid: GridPanel[][]) {
    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        const panel = grid[row][col];
        const rect = this.panels[row][col];

        let color = COLORS.neutral;

        if (panel.state === 'broken') {
          color = COLORS.broken;
        } else if (panel.state === 'cracked') {
          color = COLORS.cracked;
        } else {
          if (panel.owner === 'player1') {
            color = COLORS.player1;
          } else if (panel.owner === 'player2') {
            color = COLORS.player2;
          }
        }

        rect.setFillStyle(color);
      }
    }
  }
}
