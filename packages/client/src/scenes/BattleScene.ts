import Phaser from 'phaser';
import { BattleState } from '@mmbn/shared';
import { GridRenderer } from '../rendering/GridRenderer';
import { NaviRenderer } from '../rendering/NaviRenderer';

const GRID_START_X = 100;
const GRID_START_Y = 100;
const PANEL_SIZE = 50;

export class BattleScene extends Phaser.Scene {
  private gridRenderer?: GridRenderer;
  private naviRendererPlayer1?: NaviRenderer;
  private naviRendererPlayer2?: NaviRenderer;
  private battleState?: BattleState;
  private hpText?: Phaser.GameObjects.Text;
  private frameText?: Phaser.GameObjects.Text;

  constructor() {
    super('BattleScene');
  }

  create() {
    const { width } = this.cameras.main;

    // Create grid renderer
    this.gridRenderer = new GridRenderer(this, GRID_START_X, GRID_START_Y, PANEL_SIZE);

    // Create navi renderers
    this.naviRendererPlayer1 = new NaviRenderer(this, 'player1', PANEL_SIZE);
    this.naviRendererPlayer2 = new NaviRenderer(this, 'player2', PANEL_SIZE);

    // Create UI text
    this.hpText = this.add.text(width / 2, 20, 'P1: 200/200 | P2: 200/200', {
      fontSize: '20px',
      color: '#ffffff',
    });
    this.hpText.setOrigin(0.5, 0);

    this.frameText = this.add.text(10, 10, 'Frame: 0', {
      fontSize: '16px',
      color: '#ffffff',
    });

    // Create background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    console.log('BattleScene created');
  }

  update() {
    if (this.battleState) {
      this.frameText?.setText(`Frame: ${this.battleState.frame}`);
      this.hpText?.setText(
        `P1: ${this.battleState.player1.hp}/${this.battleState.player1.maxHp} | P2: ${this.battleState.player2.hp}/${this.battleState.player2.maxHp}`
      );

      // Update renderers
      this.gridRenderer?.update(this.battleState.grid);
      this.naviRendererPlayer1?.update(
        this.battleState.player1.position,
        this.battleState.grid,
        GRID_START_X,
        GRID_START_Y,
        PANEL_SIZE
      );
      this.naviRendererPlayer2?.update(
        this.battleState.player2.position,
        this.battleState.grid,
        GRID_START_X,
        GRID_START_Y,
        PANEL_SIZE
      );
    }
  }

  setBattleState(state: BattleState) {
    this.battleState = state;
  }

  getBattleState(): BattleState | undefined {
    return this.battleState;
  }
}
