import Phaser from 'phaser';
import { CHIPS, SimpleAI, BattleEngine, BattleState, HAND_SIZE } from '@mmbn/shared';
import { GridRenderer } from '../rendering/GridRenderer';
import { NaviRenderer } from '../rendering/NaviRenderer';
import { InputHandler } from '../input/InputHandler';
import { useBattleStore } from '../stores/battleStore';

const GRID_START_X = 250;
const GRID_START_Y = 45;
const PANEL_SIZE = 50;

export class BattleScene extends Phaser.Scene {
  private gridRenderer?: GridRenderer;
  private naviRendererPlayer1?: NaviRenderer;
  private naviRendererPlayer2?: NaviRenderer;
  private inputHandler?: InputHandler;
  private simpleAI?: SimpleAI;
  private wasCustomScreenOpen = false;

  constructor() {
    super('BattleScene');
  }

  create() {
    // Initialize battle state with real chip data
    // Randomness (drawChips) lives here, not inside BattleEngine, to keep the engine deterministic
    const chipFolder = Object.values(CHIPS);
    const player1Hand = BattleEngine.drawChips(chipFolder, HAND_SIZE);
    const player2Hand = BattleEngine.drawChips(chipFolder, HAND_SIZE);
    let initialState = BattleEngine.createInitialState(
      'player1',
      'player2',
      chipFolder,
      'Player 1',
      'Player 2',
      player1Hand,
      player2Hand,
      'campaign-battle'
    );

    // Initialize AI for player2
    this.simpleAI = new SimpleAI();

    // Set both gauges to max so AI can pre-select chips for the opening round
    initialState = {
      ...initialState,
      player1: { ...initialState.player1, customGauge: initialState.player1.maxCustomGauge },
      player2: { ...initialState.player2, customGauge: initialState.player2.maxCustomGauge },
    };

    // Pre-select up to 3 chips for AI before the player sees the screen
    for (let i = 0; i < 3; i++) {
      const aiAction = this.simpleAI.getNextAction('player2', initialState);
      if (aiAction?.type === 'chip_select') {
        const { state } = BattleEngine.applyAction(initialState, 'player2', aiAction);
        initialState = state;
      }
    }

    // Init store with AI chips loaded, then open player's chip select screen
    // (openCustomScreen resets both gauges to 0)
    useBattleStore.getState().init(initialState);
    useBattleStore.getState().openCustomScreen();

    // Create input handler
    this.inputHandler = new InputHandler(initialState.player1.position);

    // Create grid renderer
    this.gridRenderer = new GridRenderer(this, GRID_START_X, GRID_START_Y, PANEL_SIZE);

    // Create navi renderers
    this.naviRendererPlayer1 = new NaviRenderer(this, 'player1', PANEL_SIZE);
    this.naviRendererPlayer2 = new NaviRenderer(this, 'player2', PANEL_SIZE);

    this.cameras.main.setBackgroundColor('#1a1a1a');
    console.log('BattleScene created');
  }

  update() {
    const store = useBattleStore.getState();
    const battleState = store.battleState;

    if (!battleState || !this.inputHandler) return;

    // Stop ticking on game over — React overlay handles it
    if (battleState.isGameOver) {
      this.inputHandler.clearInput();
      return;
    }

    // Detect custom screen transition: closing → clear stale inputs
    if (this.wasCustomScreenOpen && !store.customScreenOpen) {
      this.inputHandler.clearInput();
    }
    this.wasCustomScreenOpen = store.customScreenOpen;

    // Custom screen is open — React owns input, Phaser freezes
    if (store.customScreenOpen) {
      this.renderGrid(store.battleState!);
      return;
    }

    // Get player1 action
    const playerAction = this.inputHandler.getNextAction(battleState.player1.position);

    if (playerAction) {
      if (
        playerAction.type === 'confirm' &&
        battleState.player1.customGauge >= battleState.player1.maxCustomGauge
      ) {
        store.openCustomScreen();
        return;
      }
      store.applyAction('player1', playerAction);
    }

    // AI action for player2
    if (this.simpleAI) {
      const currentState = useBattleStore.getState().battleState!;
      const aiAction = this.simpleAI.getNextAction('player2', currentState);
      if (aiAction) {
        store.applyAction('player2', aiAction);
      }
    }

    // Tick the battle engine
    store.tick();

    // Render from updated store state
    this.renderGrid(useBattleStore.getState().battleState!);
  }

  private renderGrid(state: BattleState) {
    this.gridRenderer?.update(state.grid);
    this.naviRendererPlayer1?.update(
      state.player1.position,
      state.grid,
      GRID_START_X,
      GRID_START_Y,
      PANEL_SIZE
    );
    this.naviRendererPlayer2?.update(
      state.player2.position,
      state.grid,
      GRID_START_X,
      GRID_START_Y,
      PANEL_SIZE
    );
  }

  shutdown() {
    this.inputHandler?.destroy();
  }
}
