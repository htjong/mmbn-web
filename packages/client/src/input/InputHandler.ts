import { PlayerAction } from '@mmbn/shared';

/**
 * Maps keyboard input to game actions
 *
 * Controls:
 * - W: Move up
 * - A: Move left
 * - S: Move down
 * - D: Move right
 * - Spacebar: Open custom bar (chip selection)
 * - K: Activate selected chip
 * - J: Use buster attack
 */
export class InputHandler {
  private keysPressed: Set<string> = new Set();

  constructor(_initialPosition: { x: number; y: number }) {
    this.setupKeyListeners();
  }

  private setupKeyListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.keysPressed.add(key);
  }

  private handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.keysPressed.delete(key);
  }

  /**
   * Get the next action from current keyboard input
   * Priority: Movement > Buster > Chip > Custom (only one per frame)
   */
  getNextAction(currentGridPosition: { x: number; y: number }): PlayerAction | null {

    // Movement takes priority
    if (this.keysPressed.has('w')) {
      return { type: 'move', gridX: currentGridPosition.x, gridY: currentGridPosition.y - 1 };
    }
    if (this.keysPressed.has('a')) {
      return { type: 'move', gridX: currentGridPosition.x - 1, gridY: currentGridPosition.y };
    }
    if (this.keysPressed.has('s')) {
      return { type: 'move', gridX: currentGridPosition.x, gridY: currentGridPosition.y + 1 };
    }
    if (this.keysPressed.has('d')) {
      return { type: 'move', gridX: currentGridPosition.x + 1, gridY: currentGridPosition.y };
    }

    // Buster attack
    if (this.keysPressed.has('j')) {
      return { type: 'buster' };
    }

    // Chip activation
    if (this.keysPressed.has('k')) {
      return { type: 'chip_use' };
    }

    // Custom bar (spacebar)
    if (this.keysPressed.has(' ')) {
      return { type: 'confirm' };
    }

    return null;
  }

  /**
   * Check if a specific key is currently pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }

  /**
   * Clear all pressed keys (useful on scene transitions)
   */
  clearInput() {
    this.keysPressed.clear();
  }

  /**
   * Cleanup: remove event listeners
   */
  destroy() {
    // Note: In real implementation, would store and remove specific listeners
    // This is a simplified version
    this.keysPressed.clear();
  }
}
