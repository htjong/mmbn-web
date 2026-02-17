import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketManager } from './SocketManager';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 3000;

const socketManager = new SocketManager(io);
socketManager.initialize();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
