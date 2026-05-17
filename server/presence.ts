export class PresenceTracker {
  private rooms = new Map<string, Map<string, Set<string>>>();

  add(room: string, userId: string, socketId: string): void {
    let users = this.rooms.get(room);
    if (!users) {
      users = new Map();
      this.rooms.set(room, users);
    }
    let sockets = users.get(userId);
    if (!sockets) {
      sockets = new Set();
      users.set(userId, sockets);
    }
    sockets.add(socketId);
  }

  remove(room: string, userId: string, socketId: string): void {
    const users = this.rooms.get(room);
    if (!users) return;
    const sockets = users.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      users.delete(userId);
      if (users.size === 0) this.rooms.delete(room);
    }
  }

  removeSocket(socketId: string): string[] {
    const affected: string[] = [];
    for (const [room, users] of this.rooms) {
      for (const [userId, sockets] of users) {
        if (sockets.delete(socketId)) {
          if (sockets.size === 0) users.delete(userId);
          affected.push(room);
        }
      }
      if (users.size === 0) this.rooms.delete(room);
    }
    return Array.from(new Set(affected));
  }

  userIds(room: string): string[] {
    const users = this.rooms.get(room);
    return users ? Array.from(users.keys()) : [];
  }
}
