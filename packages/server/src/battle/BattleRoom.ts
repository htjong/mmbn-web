import { Server } from 'socket.io';
import { BattleInputSchema, validateInput } from '@mmbn/shared';
import { BattleSimulator } from './BattleSimulator.js';
import { QueuedPlayer } from '../matchmaking/Queue.js';

export class BattleRoom {
  readonly roomId: string;
  private io: Server;
  private simulator: BattleSimulator;
  private playerMap: Map<string, 'player1' | 'player2'> = new Map();
  private socketIds: [string, string];
  private onDestroy: (roomId: string) => void;

  constructor(
    roomId: string,
    io: Server,
    player1: QueuedPlayer,
    player2: QueuedPlayer,
    onDestroy: (roomId: string) => void
  ) {
    this.roomId = roomId;
    this.io = io;
    this.socketIds = [player1.socketId, player2.socketId];
    this.onDestroy = onDestroy;

    this.playerMap.set(player1.socketId, 'player1');
    this.playerMap.set(player2.socketId, 'player2');

    this.simulator = new BattleSimulator(
      player1.playerName,
      player2.playerName,
      (frame, state, events) => {
        this.io.to(this.roomId).emit('battle:update', { frame, state, events });
      },
      (state) => {
        this.io.to(this.roomId).emit('battle:end', {
          winner: state.winner,
          state,
        });
        this.destroy();
      }
    );
  }

  start(): void {
    // Join both sockets to the room
    for (const socketId of this.socketIds) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.join(this.roomId);
      }
    }

    // Emit battle:start to each player with their role
    const initialState = this.simulator.getState();
    for (const [socketId, role] of this.playerMap) {
      this.io.to(socketId).emit('battle:start', {
        role,
        state: initialState,
      });
    }

    this.simulator.start();
  }

  handleInput(socketId: string, data: unknown): void {
    const role = this.playerMap.get(socketId);
    if (!role) return;

    const input = validateInput(BattleInputSchema, data);
    if (!input) return;

    this.simulator.applyAction(role, input.action);
  }

  handleDisconnect(socketId: string): void {
    const role = this.playerMap.get(socketId);
    if (!role) return;

    const winner = role === 'player1' ? 'player2' : 'player1';
    this.simulator.forceWin(winner);
  }

  private destroy(): void {
    this.simulator.stop();

    // Remove sockets from the room
    for (const socketId of this.socketIds) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(this.roomId);
      }
    }

    this.onDestroy(this.roomId);
  }
}
