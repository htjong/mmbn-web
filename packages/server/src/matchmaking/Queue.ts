export interface QueuedPlayer {
  socketId: string;
  playerId: string;
  playerName: string;
}

export class Queue {
  private players: QueuedPlayer[] = [];
  private onMatch: (player1: QueuedPlayer, player2: QueuedPlayer) => void;

  constructor(onMatch: (player1: QueuedPlayer, player2: QueuedPlayer) => void) {
    this.onMatch = onMatch;
  }

  add(player: QueuedPlayer): void {
    // Prevent duplicate entries by socketId
    if (this.players.some((p) => p.socketId === player.socketId)) {
      return;
    }

    this.players.push(player);

    // When 2 players are waiting, fire match callback
    if (this.players.length >= 2) {
      const player1 = this.players.shift()!;
      const player2 = this.players.shift()!;
      this.onMatch(player1, player2);
    }
  }

  remove(socketId: string): void {
    this.players = this.players.filter((p) => p.socketId !== socketId);
  }

  getSize(): number {
    return this.players.length;
  }
}
