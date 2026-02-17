import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  render: {
    pixelArt: true,
    antialias: false,
  },
  scene: {
    create: () => {
      console.log('Game initialized');
    },
  },
};

const game = new Phaser.Game(config);
console.log('MMBN Web Game Starting...');
