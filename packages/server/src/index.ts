import { createServer } from 'http';
import { Server } from 'socket.io';
import { SocketManager } from './SocketManager.js';

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  },
});

const PORT = process.env.PORT || 3000;

const socketManager = new SocketManager(io);
socketManager.initialize();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
