"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plural, Trans, useLingui } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { RoomLevel, TowersRoomPlayerWithRelations, TowersRoomsListWithCount } from "db";
import useSWR from "swr";
import Button from "@/components/ui/Button";
import { ROUTE_TOWERS } from "@/constants/routes";
import { SocketEvents } from "@/constants/socket-events";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";

export default function RoomsList(): ReactNode {
  const router = useRouter();
  const { socketRef, isConnected, session } = useSocket();
  const { t } = useLingui();
  const [rooms, setRooms] = useState<TowersRoomsListWithCount[]>([]);

  const { error: roomsError, mutate: loadRoomsList } = useSWR<ApiResponse<TowersRoomsListWithCount[]>>(
    "/api/games/towers/rooms",
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (response: ApiResponse<TowersRoomsListWithCount[]>) => {
        if (response.success && response.data) {
          setRooms(response.data);
        }
      },
    },
  );

  useEffect(() => {
    if (!socketRef.current) return;

    const handleUpdateRoomslist = async (): Promise<void> => {
      await loadRoomsList();
    };

    socketRef.current?.on(SocketEvents.ROOMS_LIST_UPDATED, handleUpdateRoomslist);

    return () => {
      socketRef.current?.off(SocketEvents.ROOMS_LIST_UPDATED, handleUpdateRoomslist);
    };
  }, [isConnected]);

  const handleJoinRoom = (roomId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`);
  };

  if (roomsError) return <div>Error: {roomsError.message}</div>;

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,_minmax(14rem,_1fr))] gap-8">
      {rooms?.map((room: TowersRoomsListWithCount) => {
        const usersCount: number = room._count.players;
        const isUserInRoom: boolean = room.players?.some(
          (roomPlayer: TowersRoomPlayerWithRelations) => roomPlayer.player.id === session?.user?.id,
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
