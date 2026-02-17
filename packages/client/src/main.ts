import Phaser from 'phaser';
import { BattleScene } from './scenes/BattleScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  parent: 'app',
  render: {
    pixelArt: true,
    antialias: false,
  },
  scene: [BattleScene],
};

new Phaser.Game(config);
console.log('MMBN Web Game Starting...');
