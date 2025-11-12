import { Server, Socket } from "socket.io";
import { SocketEvents } from "@/constants/socket-events";
import { SocketCallback } from "@/interfaces/socket";
import { TablePlayerAction, TablePlayerStateUpdatePayload } from "@/interfaces/tablePlayerState";
import { Session } from "@/lib/auth";
import { Player } from "@/server/towers/models/Player";
import { serverState } from "@/server/towers/models/ServerState";
import { Table } from "@/server/towers/models/Table";

export function clientEvents(io: Server, socket: Socket): void {
  const session: Session = socket.data.session;
  const playerId: string = session.user.id;
  const username: string = session.user.username;

  socket.on(SocketEvents.SOCKET_JOIN, ({ roomId, tableId }: { roomId: string; tableId: string }): void => {
    if (roomId) socket.join(roomId);
    if (tableId) socket.join(tableId);
  });

  socket.on(SocketEvents.SOCKET_LEAVE, ({ roomId, tableId }: { roomId: string; tableId: string }): void => {
    if (tableId) socket.leave(tableId);
    if (roomId) socket.leave(roomId);
  });

  socket.on(
    SocketEvents.TABLE_PLAYER_STATE_UPDATE,
    async ({ tableId, action }: TablePlayerStateUpdatePayload): Promise<void> => {
      const table: Table = serverState.getOrCreateTable(tableId);
      const player: Player = serverState.getOrCreatePlayer(playerId, username);

      switch (action) {
        case TablePlayerAction.READY:
          table.setPlayerReady(playerId, true);
          break;

        case TablePlayerAction.PLAYING:
          table.setPlayerPlaying(playerId, true);
          break;
      }

      io.to(tableId).emit(SocketEvents.TABLE_PLAYER_STATE_UPDATED, {
        playerId,
        isReady: table.isPlayerReady(player),
        isPlaying: table.isPlayerPlaying(player),
      });
    },
  );

  socket.on(
    SocketEvents.PING_REQUEST,
    async (
      { userId }: { userId: string },
      callback: <T>({ success, message, data }: SocketCallback<T>) => void,
    ): Promise<void> => {
      const startTime: number = Date.now();

      // Find the target socket
      const sockets = await io.fetchSockets();
      const target = sockets.find((socket) => socket.data?.session?.user?.id === userId);

      if (!target) {
        callback({ success: false, message: "Target not found" });
        return;
      }

      try {
        target.timeout(2000).emit(SocketEvents.PING_ECHO, {}, (err: unknown, ok: boolean) => {
          if (err || !ok) {
            callback({ success: false, message: "Ping failed" });
            return;
          }

          const roundTrip: number = Date.now() - startTime;
          callback({ success: true, message: "Ping successfully sent back!", data: { roundTrip } });
        });
      } catch {
        callback({ success: false, message: "Unexpected error" });
      }
    },
  );
}
