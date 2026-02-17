import Phaser from 'phaser';
import { GridPanel } from '@mmbn/shared';

export class NaviRenderer {
  private scene: Phaser.Scene;
  private player: 'player1' | 'player2';
  private sprite?: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, player: 'player1' | 'player2', _panelSize: number) {
    this.scene = scene;
    this.player = player;
  }

  update(
    position: { x: number; y: number },
    _grid: GridPanel[][],
    gridStartX: number,
    gridStartY: number,
    panelSize: number
  ) {
    const screenX = gridStartX + position.x * panelSize + panelSize / 2;
    const screenY = gridStartY + position.y * panelSize + panelSize / 2;

    if (!this.sprite) {
      const color = this.player === 'player1' ? 0x00ff00 : 0xff00ff;
      this.sprite = this.scene.add.rectangle(screenX, screenY, panelSize - 10, panelSize - 10);
      this.sprite.setFillStyle(color);
      this.sprite.setStrokeStyle(2, 0xffffff);
      this.sprite.setDepth(10);
    } else {
      this.sprite.setPosition(screenX, screenY);
    }
  }
}
