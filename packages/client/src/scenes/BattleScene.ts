import Phaser from 'phaser';
import { BattleState, BattleEngine, Chip } from '@mmbn/shared';
import { GridRenderer } from '../rendering/GridRenderer';
import { NaviRenderer } from '../rendering/NaviRenderer';
import { InputHandler } from '../input/InputHandler';

const GRID_START_X = 100;
const GRID_START_Y = 100;
const PANEL_SIZE = 50;

export class BattleScene extends Phaser.Scene {
  private gridRenderer?: GridRenderer;
  private naviRendererPlayer1?: NaviRenderer;
  private naviRendererPlayer2?: NaviRenderer;
  private battleState?: BattleState;
  private inputHandler?: InputHandler;
  private hpText?: Phaser.GameObjects.Text;
  private frameText?: Phaser.GameObjects.Text;
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super('BattleScene');
  }

  create() {
    const { width } = this.cameras.main;

    // Initialize battle state
    const testChips: Chip[] = []; // TODO: Load from chip data
    this.battleState = BattleEngine.createInitialState('player1', 'player2', testChips, 'Player 1', 'Player 2');

    // Create input handler (follows player1, starts at their position)
    this.inputHandler = new InputHandler(this.battleState.player1.position);

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

    this.statusText = this.add.text(width / 2, 50, 'Battle in progress...', {
      fontSize: '16px',
      color: '#ffffff',
    });
    this.statusText.setOrigin(0.5, 0);

    // Create background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    console.log('BattleScene created');
  }

  update() {
    if (!this.battleState || !this.inputHandler) {
      return;
    }

    // Check for game over
    if (this.battleState.isGameOver) {
      const winner = this.battleState.winner === 'player1' ? 'Player 1' : 'Player 2';
      this.statusText?.setText(`Battle Over! ${winner} wins!`);
      this.inputHandler.clearInput();
      return;
    }

    // Get player action from input handler
    const playerAction = this.inputHandler.getNextAction(this.battleState.player1.position);

    // Apply player1 action if available
    if (playerAction) {
      const { state, events } = BattleEngine.applyAction(this.battleState, 'player1', playerAction);
      this.battleState = state;

      // Log events for debugging
      if (events.length > 0) {
        console.log('Events:', events);
      }
    }

    // Advance battle state
    const { state: newState, events: tickEvents } = BattleEngine.tick(this.battleState);
    this.battleState = newState;

    if (tickEvents.length > 0) {
      console.log('Tick events:', tickEvents);
    }

    // Update UI text
    this.frameText?.setText(`Frame: ${this.battleState.frame}`);
    this.hpText?.setText(
      `P1: ${this.battleState.player1.hp}/${this.battleState.player1.maxHp} | P2: ${this.battleState.player2.hp}/${this.battleState.player2.maxHp}`
    );

    // Update status text with custom gauge info
    const p1Gauge = this.battleState.player1.customGauge;
    const p2Gauge = this.battleState.player2.customGauge;
    this.statusText?.setText(`Battle! | Custom: P1 ${p1Gauge}% P2 ${p2Gauge}%`);

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

  setBattleState(state: BattleState) {
    this.battleState = state;
  }

  getBattleState(): BattleState | undefined {
    return this.battleState;
  }

  shutdown() {
    // Clean up input handler on scene shutdown
    this.inputHandler?.destroy();
  }
}
