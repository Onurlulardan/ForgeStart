import 'dotenv/config';
import { createServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../lib/realtime/types';
import { authenticateFromCookie } from './auth';
import { PresenceTracker } from './presence';

type AppServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const PORT = Number(process.env.REALTIME_PORT ?? 4000);
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  'http://localhost:3000';

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, ts: new Date().toISOString() }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: [APP_URL],
    credentials: true,
  },
});

const presence = new PresenceTracker();

io.use(async (socket, next) => {
  const cookie =
    socket.request.headers.cookie ??
    (typeof socket.handshake.auth?.cookie === 'string'
      ? (socket.handshake.auth.cookie as string)
      : undefined);
  const user = await authenticateFromCookie(cookie, APP_URL);
  if (!user) {
    next(new Error('unauthorized'));
    return;
  }
  socket.data.user = user;
  next();
});

io.on('connection', (socket: AppServerSocket) => {
  const user = socket.data.user;
  console.log(`[realtime] ${user.email} connected (${socket.id})`);

  socket.emit('system:hello', { user, serverTime: new Date().toISOString() });

  socket.on('room:join', async (room, ack) => {
    try {
      await socket.join(room);
      presence.add(room, user.id, socket.id);
      io.to(room).emit('presence:update', {
        room,
        userIds: presence.userIds(room),
      });
      ack?.(true);
    } catch (err) {
      console.error('[realtime] room:join error', err);
      ack?.(false);
    }
  });

  socket.on('room:leave', async (room) => {
    await socket.leave(room);
    presence.remove(room, user.id, socket.id);
    io.to(room).emit('presence:update', {
      room,
      userIds: presence.userIds(room),
    });
  });

  socket.on('presence:ping', (room) => {
    socket.emit('presence:update', { room, userIds: presence.userIds(room) });
  });

  socket.on('disconnect', () => {
    const rooms = presence.removeSocket(socket.id);
    rooms.forEach((room) => {
      io.to(room).emit('presence:update', { room, userIds: presence.userIds(room) });
    });
    console.log(`[realtime] ${user.email} disconnected (${socket.id})`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[realtime] listening on http://localhost:${PORT}`);
});

const shutdown = () => {
  console.log('[realtime] shutting down...');
  io.close(() => httpServer.close(() => process.exit(0)));
  setTimeout(() => process.exit(1), 5000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
