import Phaser from 'phaser';
import { Chip } from '@mmbn/shared';

const ELEMENT_COLORS: Record<string, number> = {
  normal: 0xcccccc,
  fire: 0xff6600,
  aqua: 0x0099ff,
  elec: 0xffff00,
  wood: 0x00cc00,
  wind: 0x99ccff,
  break: 0xff0000,
  cursor: 0xffffff,
};

export class ChipRenderer {
  private scene: Phaser.Scene;
  private chip: Chip;
  private sprite?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, chip: Chip) {
    this.scene = scene;
    this.chip = chip;
  }

  render(x: number, y: number): Phaser.GameObjects.Container {
    const color = ELEMENT_COLORS[this.chip.element] || 0xcccccc;

    const circle = this.scene.add.circle(x, y, 15);
    circle.setFillStyle(color);

    const text = this.scene.add.text(x, y, this.chip.name.slice(0, 1), {
      fontSize: '12px',
      color: '#000000',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    const container = this.scene.add.container(x, y, [circle, text]);
    return container;
  }

  setPosition(x: number, y: number) {
    if (this.sprite) {
      this.sprite.setPosition(x, y);
    }
  }
}
