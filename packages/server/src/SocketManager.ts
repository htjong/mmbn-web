import { Server } from 'socket.io';
import { QueueJoinSchema, validateInput } from '@mmbn/shared';
import { Queue, QueuedPlayer } from './matchmaking/Queue';
import { BattleRoom } from './battle/BattleRoom';

export class SocketManager {
  private io: Server;
  private queue: Queue;
  private rooms: Map<string, BattleRoom> = new Map();
  private playerToRoom: Map<string, string> = new Map();
  private roomCounter = 0;

  constructor(io: Server) {
    this.io = io;
    this.queue = new Queue((player1, player2) => this.handleMatch(player1, player2));
  }

  initialize(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('queue:join', (data: unknown) => {
        const input = validateInput(QueueJoinSchema, data);
        if (!input) {
          socket.emit('error', { message: 'Invalid queue:join data' });
          return;
        }

        this.queue.add({
          socketId: socket.id,
          playerId: input.playerId,
          playerName: input.playerName,
        });

        socket.emit('queue:joined');
        console.log(`Player ${input.playerName} joined queue (size: ${this.queue.getSize()})`);
      });

      socket.on('queue:leave', () => {
        this.queue.remove(socket.id);
        socket.emit('queue:left');
        console.log(`Player left queue (size: ${this.queue.getSize()})`);
      });

      socket.on('battle:input', (data: unknown) => {
        const roomId = this.playerToRoom.get(socket.id);
        if (!roomId) return;

        const room = this.rooms.get(roomId);
        if (!room) return;

        room.handleInput(socket.id, data);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Remove from queue
        this.queue.remove(socket.id);

        // Forfeit any active battle
        const roomId = this.playerToRoom.get(socket.id);
        if (roomId) {
          const room = this.rooms.get(roomId);
          if (room) {
            room.handleDisconnect(socket.id);
          }
        }
      });
    });
  }

  private handleMatch(player1: QueuedPlayer, player2: QueuedPlayer): void {
    const roomId = `room_${++this.roomCounter}`;
    console.log(`Match found: ${player1.playerName} vs ${player2.playerName} → ${roomId}`);

    // Emit match:found to both players
    this.io.to(player1.socketId).emit('match:found', {
      opponent: player2.playerName,
    });
    this.io.to(player2.socketId).emit('match:found', {
      opponent: player1.playerName,
    });

    // Create battle room
    const room = new BattleRoom(roomId, this.io, player1, player2, (id) => {
      this.destroyRoom(id);
    });

    this.rooms.set(roomId, room);
    this.playerToRoom.set(player1.socketId, roomId);
    this.playerToRoom.set(player2.socketId, roomId);

    room.start();
  }

  private destroyRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Clean up player-to-room mappings
    for (const [socketId, rId] of this.playerToRoom) {
      if (rId === roomId) {
        this.playerToRoom.delete(socketId);
      }
    }

    this.rooms.delete(roomId);
    console.log(`Room ${roomId} destroyed`);
  }
}
