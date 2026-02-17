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
  private keysJustPressed: Set<string> = new Set();

  constructor(_initialPosition: { x: number; y: number }) {
    this.setupKeyListeners();
  }

  private setupKeyListeners() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!this.keysPressed.has(key)) {
      this.keysJustPressed.add(key);
    }
    this.keysPressed.add(key);
  }

  private handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.keysPressed.delete(key);
  }

  /**
   * Get the next action from current keyboard input
   * Priority: Movement > Buster > Chip > Custom (only one per frame)
   * Movement keys require a fresh press (no hold-to-repeat)
   */
  getNextAction(currentGridPosition: { x: number; y: number }): PlayerAction | null {

    // Movement requires a fresh key press (consumed after use)
    if (this.keysJustPressed.has('w')) {
      this.keysJustPressed.delete('w');
      return { type: 'move', gridX: currentGridPosition.x, gridY: currentGridPosition.y - 1 };
    }
    if (this.keysJustPressed.has('a')) {
      this.keysJustPressed.delete('a');
      return { type: 'move', gridX: currentGridPosition.x - 1, gridY: currentGridPosition.y };
    }
    if (this.keysJustPressed.has('s')) {
      this.keysJustPressed.delete('s');
      return { type: 'move', gridX: currentGridPosition.x, gridY: currentGridPosition.y + 1 };
    }
    if (this.keysJustPressed.has('d')) {
      this.keysJustPressed.delete('d');
      return { type: 'move', gridX: currentGridPosition.x + 1, gridY: currentGridPosition.y };
    }

    // Buster attack (also consume to prevent repeat)
    if (this.keysJustPressed.has('j')) {
      this.keysJustPressed.delete('j');
      return { type: 'buster' };
    }

    // Chip activation (also consume)
    if (this.keysJustPressed.has('k')) {
      this.keysJustPressed.delete('k');
      return { type: 'chip_use' };
    }

    // Custom bar (spacebar, also consume)
    if (this.keysJustPressed.has(' ')) {
      this.keysJustPressed.delete(' ');
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
    this.keysJustPressed.clear();
  }

  /**
   * Cleanup: remove event listeners
   */
  destroy() {
    this.keysPressed.clear();
    this.keysJustPressed.clear();
  }
}
