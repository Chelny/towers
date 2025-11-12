import { DefaultEventsMap, RemoteSocket, Socket } from "socket.io";
import { playerSockets } from "@/server/socket/player-sockets";
import { getIo } from "@/server/socket/io";

export class SocketEmitter {
  public static toRoom(room: string) {
    return getIo().to(room);
  }

  public static emitToAll<T>(event: string, payload?: T): void {
    getIo().emit(event, payload);
  }

  public static emitToRoom<T>(room: string | string[], event: string, payload?: T): void {
    getIo().to(room).emit(event, payload);
  }

  public static async joinRoom(userId: string, room: string): Promise<void> {
    const sockets: Set<Socket> | undefined = playerSockets.get(userId);

    if (sockets && sockets.size > 0) {
      for (const socket of sockets) {
        socket.join(room);
      }
    } else {
      const remote = await SocketEmitter.findSocket(userId);
      if (remote) remote.join(room);
    }
  }

  public static async leaveRoom(userId: string, room: string): Promise<void> {
    const sockets: Set<Socket> | undefined = playerSockets.get(userId);

    if (sockets && sockets.size > 0) {
      for (const socket of sockets) {
        socket.leave(room);
      }
    } else {
      const remote = await SocketEmitter.findSocket(userId);
      if (remote) remote.leave(room);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static async findSocket(socketId: string): Promise<RemoteSocket<DefaultEventsMap, any> | undefined> {
    const sockets = await getIo().fetchSockets();
    return sockets.find((socket) => socket.data?.session?.user?.id === socketId);
  }
}
