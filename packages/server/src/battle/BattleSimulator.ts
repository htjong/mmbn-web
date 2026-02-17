import { BattleEngine, BattleState, BattleEvent, PlayerAction, CHIPS } from '@mmbn/shared';

const TICK_RATE = 60;
const TICK_INTERVAL = 1000 / TICK_RATE;

export class BattleSimulator {
  private state: BattleState;
  private interval: ReturnType<typeof setInterval> | null = null;
  private onTick: (frame: number, state: BattleState, events: BattleEvent[]) => void;
  private onGameOver: (state: BattleState) => void;

  constructor(
    player1Name: string,
    player2Name: string,
    onTick: (frame: number, state: BattleState, events: BattleEvent[]) => void,
    onGameOver: (state: BattleState) => void
  ) {
    this.onTick = onTick;
    this.onGameOver = onGameOver;

    const folder = Object.values(CHIPS);
    this.state = BattleEngine.createInitialState(
      'player1',
      'player2',
      folder,
      player1Name,
      player2Name
    );
  }

  start(): void {
    if (this.interval) return;

    this.interval = setInterval(() => {
      if (this.state.isGameOver) {
        this.stop();
        return;
      }

      const result = BattleEngine.tick(this.state);
      this.state = result.state;

      this.onTick(this.state.frame, this.state, result.events);

      if (this.state.isGameOver) {
        this.stop();
        this.onGameOver(this.state);
      }
    }, TICK_INTERVAL);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  applyAction(playerId: 'player1' | 'player2', action: PlayerAction): void {
    if (this.state.isGameOver) return;

    const result = BattleEngine.applyAction(this.state, playerId, action);
    this.state = result.state;
  }

  forceWin(winner: 'player1' | 'player2'): void {
    if (this.state.isGameOver) return;

    this.state.isGameOver = true;
    this.state.winner = winner;

    const loser = winner === 'player1' ? this.state.player2 : this.state.player1;
    loser.hp = 0;

    this.stop();
    this.onGameOver(this.state);
  }

  getState(): BattleState {
    return this.state;
  }
}
