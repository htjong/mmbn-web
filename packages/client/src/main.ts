import Phaser from 'phaser';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BattleScene } from './scenes/BattleScene';
import { BattleHud } from './ui/organisms/BattleHud';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 240,
  backgroundColor: '#1a1a1a',
  parent: 'app',
  render: {
    pixelArt: true,
    antialias: false,
  },
  scene: [BattleScene],
};

new Phaser.Game(config);

const uiRoot = document.getElementById('ui')!;
createRoot(uiRoot).render(React.createElement(BattleHud));

console.log('MMBN Web Game Starting...');
