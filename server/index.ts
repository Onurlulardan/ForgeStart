import 'dotenv/config';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
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
const INTERNAL_SECRET = process.env.AUTH_SECRET ?? '';

interface InternalEmitBody {
  event: keyof ServerToClientEvents;
  payload: unknown;
  room?: string;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (!raw) return resolve(null);
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

const httpServer = createServer(async (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, ts: new Date().toISOString() });
    return;
  }

  if (req.url === '/internal/emit' && req.method === 'POST') {
    const auth = req.headers.authorization ?? '';
    if (!INTERNAL_SECRET || auth !== `Bearer ${INTERNAL_SECRET}`) {
      sendJson(res, 401, { ok: false, error: 'unauthorized' });
      return;
    }
    try {
      const body = (await readJsonBody(req)) as InternalEmitBody | null;
      if (!body?.event) {
        sendJson(res, 400, { ok: false, error: 'event is required' });
        return;
      }
      const target = body.room ? io.to(body.room) : io;
      target.emit(body.event, body.payload as never);
      sendJson(res, 200, { ok: true });
    } catch (err) {
      console.error('[realtime] /internal/emit', err);
      sendJson(res, 500, { ok: false, error: 'internal error' });
    }
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
