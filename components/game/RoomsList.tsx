"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { RoomLevel } from "db";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import Button from "@/components/ui/Button";
import { ROUTE_TOWERS } from "@/constants/routes";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";
import { RoomPlainObject } from "@/server/towers/classes/Room";
import { RoomPlayerPlainObject } from "@/server/towers/classes/RoomPlayer";

export default function RoomsList(): ReactNode {
  const router = useRouter();
  const { t } = useLingui();
  const { socketRef, isConnected, session } = useSocket();
  const [rooms, setRooms] = useState<RoomPlainObject[]>([]);

  const {
    data: roomsResponse,
    error: roomsError,
    mutate: loadRooms,
  } = useSWR<ApiResponse<RoomPlainObject[]>>("/api/games/towers/rooms", fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  useEffect(() => {
    if (roomsResponse?.success && roomsResponse.data) {
      setRooms(roomsResponse.data);
    }
  }, [roomsResponse]);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const handleUpdateRoomslist = async (): Promise<void> => {
      await loadRooms();
    };

    const attachListeners = (): void => {
      socket.on(ServerToClientEvents.ROOMS_LIST_UPDATED, handleUpdateRoomslist);
    };

    if (socket.connected) {
      attachListeners();
    } else {
      socket.once("connect", () => {
        attachListeners();
      });
    }

    return () => {
      socket.off(ServerToClientEvents.ROOMS_LIST_UPDATED, handleUpdateRoomslist);
      socket.off("connect");
    };
  }, [isConnected, socketRef]);

  const handleJoinRoom = (roomId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`);
  };

  if (roomsError) return <div>Error: {roomsError.message}</div>;

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms?.map((room: RoomPlainObject) => {
        const usersCount: number = room.playersCount;
        const isUserInRoom: boolean = room.players?.some(
          (roomPlayer: RoomPlayerPlainObject) => roomPlayer.playerId === session?.user?.id,
        );

        return (
          <li
            key={room.id}
            className={clsx(
              "flex flex-col gap-2 p-4 border border-gray-300 rounded-sm bg-white",
              room.isFull && "has-[button:disabled]:opacity-50",
              "dark:border-dark-card-border dark:bg-dark-card-background",
            )}
          >
            <div className="font-medium">{room.name}</div>
            <div>
              {room.level === RoomLevel.SOCIAL ? (
                <Trans>Social</Trans>
              ) : room.level === RoomLevel.BEGINNER ? (
                <Trans>Beginner</Trans>
              ) : room.level === RoomLevel.INTERMEDIATE ? (
                <Trans>Intermediate</Trans>
              ) : room.level === RoomLevel.ADVANCED ? (
                <Trans>Advanced</Trans>
              ) : undefined}
            </div>
            <div>
              <Plural value={usersCount} zero="no users" one="# user" other="# users" />
            </div>
            <div>
              <Button
                type="button"
                className={clsx("w-full", room.isFull && "cursor-not-allowed")}
                disabled={room.isFull || isUserInRoom}
                onClick={() => !room.isFull && handleJoinRoom(room.id)}
              >
                {isUserInRoom
                  ? t({ message: "Joined" })
                  : room.isFull
                    ? t({ message: "Full" })
                    : t({ message: "Join" })}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
