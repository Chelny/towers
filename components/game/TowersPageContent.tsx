"use client";

import { ReactNode, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { NotificationType } from "db";
import { Socket } from "socket.io-client";
import { ROUTE_TOWERS } from "@/constants/routes";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { useGame } from "@/context/GameContext";
import { useSocket } from "@/context/SocketContext";
import { NotificationPlainObject } from "@/server/towers/classes/Notification";

const Room = dynamic(() => import("@/components/game/Room"));
const Table = dynamic(() => import("@/components/game/Table"));

export default function TowersPageContent(): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId: string | null = searchParams.get("room");
  const tableId: string | null = searchParams.get("table");
  const { socketRef, isConnected } = useSocket();
  const { setActiveRoomId, removeJoinedTable, activeTableId, setActiveTableId } = useGame();

  useEffect(() => {
    setActiveRoomId(roomId);
  }, [roomId]);

  useEffect(() => {
    setActiveTableId(tableId);
  }, [tableId]);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const handleUpdateNotification = ({ notification }: { notification: NotificationPlainObject }): void => {
      if (notification.type === NotificationType.TABLE_BOOTED && !!notification.bootedFromTable) {
        removeJoinedTable(notification.bootedFromTable.tableId);

        if (activeTableId === notification.bootedFromTable.tableId) {
          setActiveTableId(null);
          router.push(`${ROUTE_TOWERS.PATH}?room=${notification.bootedFromTable.table.roomId}`);
        }
      }
    };

    const attachListeners = (): void => {
      socket.on(ServerToClientEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);
    };

    if (socket.connected) {
      attachListeners();
    } else {
      socket.once("connect", () => {
        attachListeners();
      });
    }

    return () => {
      socket.off(ServerToClientEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);
      socket.off("connect");
    };
  }, [isConnected, socketRef, activeTableId]);

  return <>{tableId ? <Table key={tableId} /> : <Room key={roomId} />}</>;
}
