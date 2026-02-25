import { BattleState, PlayerAction, PlayerState } from '../types/BattleState.js';
import { GRID_WIDTH, GRID_HEIGHT } from '../types/GridTypes.js';

/**
 * Simple AI for single-player battles.
 * Makes decisions for the AI-controlled player each frame.
 * Uses Math.random() — determinism is not required for AI decisions.
 *
 * Key behaviors:
 * - Separate cooldowns for movement and attacks (feels responsive)
 * - Row-aware movement: biases toward opponent's row so buster/chips land
 * - Selects multiple chips per gauge cycle (up to 3)
 * - Only uses buster when on same row as opponent
 */
export class SimpleAI {
  private moveCooldown: number = 0;
  private attackCooldown: number = 0;
  private readonly MOVE_INTERVAL = 20; // ~0.33s at 60fps
  private readonly ATTACK_INTERVAL = 40; // ~0.67s at 60fps
  private chipSelectCount: number = 0;
  private readonly MAX_CHIP_SELECTS = 3;

  getNextAction(aiPlayerId: string, state: BattleState): PlayerAction | null {
    // Decrement cooldowns
    if (this.moveCooldown > 0) this.moveCooldown--;
    if (this.attackCooldown > 0) this.attackCooldown--;

    const player = aiPlayerId === 'player1' ? state.player1 : state.player2;
    const opponent = aiPlayerId === 'player1' ? state.player2 : state.player1;
    const playerSide = aiPlayerId === 'player1' ? 'player1' : 'player2';

    // Priority 1: Select chips when gauge is full (no cooldown — rapid-fire selects)
    if (
      player.customGauge >= player.maxCustomGauge &&
      player.hand.length > 0 &&
      this.chipSelectCount < this.MAX_CHIP_SELECTS
    ) {
      this.chipSelectCount++;
      return { type: 'chip_select', chipId: player.hand[0].id };
    }

    // Reset chip select counter when gauge isn't full (new cycle)
    if (player.customGauge < player.maxCustomGauge) {
      this.chipSelectCount = 0;
    }

    // Priority 2: Use chip if one is selected (attack cooldown)
    if (this.attackCooldown <= 0 && player.selectedChips.length > 0) {
      this.attackCooldown = this.ATTACK_INTERVAL;
      return { type: 'chip_use' };
    }

    // Priority 3: Buster only when on same row as opponent (attack cooldown)
    if (
      this.attackCooldown <= 0 &&
      player.position.y === opponent.position.y &&
      player.busterPhase === 'idle' &&
      player.busterCooldown === 0
    ) {
      this.attackCooldown = this.ATTACK_INTERVAL;
      return { type: 'buster' };
    }

    // Priority 4: Movement with row-awareness (move cooldown)
    if (this.moveCooldown <= 0) {
      const move = this.getSmartMove(player, opponent, playerSide, state);
      if (move) {
        this.moveCooldown = this.MOVE_INTERVAL;
        return move;
      }
    }

    return null;
  }

  private getSmartMove(
    player: PlayerState,
    opponent: PlayerState,
    playerSide: 'player1' | 'player2',
    state: BattleState
  ): PlayerAction | null {
    const { x, y } = player.position;
    const directions = [
      { gridX: x, gridY: y - 1 }, // up
      { gridX: x, gridY: y + 1 }, // down
      { gridX: x - 1, gridY: y }, // left
      { gridX: x + 1, gridY: y }, // right
    ];

    // Filter to valid moves: in bounds and owned by this player
    const valid = directions.filter(({ gridX, gridY }) => {
      if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) return false;
      return state.grid[gridY][gridX].owner === playerSide;
    });

    if (valid.length === 0) return null;

    // Row-aware movement: bias toward opponent's row
    if (player.position.y !== opponent.position.y) {
      // Not on same row — 70% chance to move toward opponent's Y
      if (Math.random() < 0.7) {
        const targetY = opponent.position.y;
        const toward = valid.filter(
          ({ gridY }) => Math.abs(gridY - targetY) < Math.abs(y - targetY)
        );
        if (toward.length > 0) {
          const choice = toward[Math.floor(Math.random() * toward.length)];
          return { type: 'move', gridX: choice.gridX, gridY: choice.gridY };
        }
      }
    }

    // Random valid move (dodge-like when on same row, or fallback)
    const choice = valid[Math.floor(Math.random() * valid.length)];
    return { type: 'move', gridX: choice.gridX, gridY: choice.gridY };
  }
}
