"use client";

import { ReactNode, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { NotificationType, TowersNotificationWithRelations } from "db";
import { ROUTE_TOWERS } from "@/constants/routes";
import { SocketEvents } from "@/constants/socket-events";
import { useGame } from "@/context/GameContext";
import { useSocket } from "@/context/SocketContext";

const Room = dynamic(() => import("@/components/game/Room"));
const Table = dynamic(() => import("@/components/game/Table"));

export default function TowersPageContent(): ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId: string | null = searchParams.get("room");
  const tableId: string | null = searchParams.get("table");
  const { socketRef, isConnected } = useSocket();
  const { activeRoomId, setActiveRoomId, removeJoinedTable, activeTableId, setActiveTableId } = useGame();

  useEffect(() => {
    setActiveRoomId(roomId);
    setActiveTableId(tableId);

    if (isConnected && socketRef.current && roomId) {
      socketRef.current.emit(SocketEvents.SOCKET_JOIN, { roomId, tableId });
    }

    return () => {
      if (socketRef.current && roomId) {
        socketRef.current.emit(SocketEvents.SOCKET_LEAVE, { roomId, tableId });
      }

      setActiveTableId(null);
      setActiveRoomId(null);
    };
  }, [roomId, activeRoomId, tableId, activeTableId, isConnected]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handleUpdateNotification = ({ notification }: { notification: TowersNotificationWithRelations }): void => {
      if (notification.type === NotificationType.TABLE_BOOTED && !!notification.bootedFromTable) {
        removeJoinedTable(notification.bootedFromTable.tableId);

        if (activeTableId === notification.bootedFromTable.tableId) {
          setActiveTableId(null);
          router.push(`${ROUTE_TOWERS.PATH}?room=${notification.bootedFromTable.table.roomId}`);
        }
      }
    };

    socketRef.current?.on(SocketEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);

    return () => {
      socketRef.current?.off(SocketEvents.TABLE_BOOTED_NOTIFICATION, handleUpdateNotification);
    };
  }, [isConnected, activeTableId]);

  return <>{tableId ? <Table key={tableId} /> : <Room key={roomId} />}</>;
}
