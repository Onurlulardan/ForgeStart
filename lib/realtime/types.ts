export interface RealtimeUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface ServerToClientEvents {
  'system:hello': (payload: { user: RealtimeUser; serverTime: string }) => void;
  'presence:update': (payload: { room: string; userIds: string[] }) => void;
  'notification:new': (payload: { id: string; title: string; body?: string }) => void;
  'resource:invalidate': (payload: { keys: string[] }) => void;
  'user:updated': (payload: { id: string }) => void;
  'organization:updated': (payload: { id: string }) => void;
  'audit-log:new': (payload: { id: string; action: string }) => void;
}

export interface ClientToServerEvents {
  'room:join': (room: string, ack?: (success: boolean) => void) => void;
  'room:leave': (room: string) => void;
  'presence:ping': (room: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  user: RealtimeUser;
}

export type RealtimeEventName = keyof ServerToClientEvents;
