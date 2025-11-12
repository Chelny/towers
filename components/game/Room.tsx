"use client";

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";
import {
  RoomLevel,
  TowersPlayerTablesJoined,
  TowersRoomChatMessageWithRelations,
  TowersRoomPlayerWithRelations,
  TowersRoomWithRelations,
  TowersTablePlayerWithRelations,
  TowersTableSeatWithRelations,
  TowersTableWithRelations,
} from "db";
import useSWRMutation from "swr/mutation";
import CreateTableModal from "@/components/game/CreateTableModal";
import RoomTable from "@/components/game/RoomTable";
import ChatSkeleton from "@/components/skeleton/ChatSkeleton";
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton";
import RoomHeaderSkeleton from "@/components/skeleton/RoomHeaderSkeleton";
import RoomTableSkeleton from "@/components/skeleton/RoomTableSkeleton";
import ServerMessageSkeleton from "@/components/skeleton/ServerMessageSkeleton";
import Button from "@/components/ui/Button";
import { InputImperativeHandle } from "@/components/ui/Input";
import { RATING_DIAMOND, RATING_GOLD, RATING_MASTER, RATING_PLATINUM, RATING_SILVER } from "@/constants/game";
import { ROUTE_TOWERS } from "@/constants/routes";
import { SocketEvents } from "@/constants/socket-events";
import { useGame } from "@/context/GameContext";
import { useModal } from "@/context/ModalContext";
import { useSocket } from "@/context/SocketContext";
import { fetcher } from "@/lib/fetcher";

const RoomHeader = dynamic(() => import("@/components/game/RoomHeader"), {
  ssr: false,
  loading: () => <RoomHeaderSkeleton />,
});

const ServerMessage = dynamic(() => import("@/components/game/ServerMessage"), {
  ssr: false,
  loading: () => <ServerMessageSkeleton />,
});

const Chat = dynamic(() => import("@/components/game/Chat"), {
  ssr: false,
  loading: () => <ChatSkeleton />,
});

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  ssr: false,
  loading: () => <PlayersListSkeleton isTableNumberVisible />,
});

export default function Room(): ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId: string | null = searchParams.get("room");

  if (!roomId) {
    throw new Error("Room ID is required");
  }

  const { socketRef, isConnected, session } = useSocket();
  const { addJoinedRoom, removeJoinedRoom, setActiveRoomId } = useGame();
  const { openModal } = useModal();
  const isJoinedRoomRef = useRef<boolean>(false);
  const joinedRoomSidebarRef = useRef<Set<string>>(new Set<string>());
  const messageInputRef = useRef<InputImperativeHandle>(null);
  const [room, setRoom] = useState<TowersRoomWithRelations>();

  const { trigger: joinRoom, isMutating: isJoinRoomMutating } = useSWRMutation(
    `/api/games/towers/rooms/${roomId}/players`,
    (url: string) => fetcher<TowersRoomWithRelations>(url, { method: "POST" }),
    {
      onSuccess(response: ApiResponse<TowersRoomWithRelations>) {
        if (response.success) {
          const room: TowersRoomWithRelations | undefined = response.data;
          if (room) {
            setRoom(room);

            if (!joinedRoomSidebarRef.current.has(room.id)) {
              addJoinedRoom({ id: room.id, name: room.name, basePath: ROUTE_TOWERS.PATH });
              joinedRoomSidebarRef.current.add(room.id);
            }
          }
        }
      },
      onError: (error) => {
        if (error.status === 403) {
          // TODO: Show Toast: Table cannot be accessed.
          router.push(ROUTE_TOWERS.PATH);
        }
      },
    },
  );

  const { trigger: playNow, isMutating: isPlayNowMutating } = useSWRMutation(
    `/api/games/towers/rooms/${roomId}/play-now`,
    (url: string) => fetcher<string>(url, { method: "POST" }),
    {
      onSuccess(response: ApiResponse<string>) {
        if (response.success) {
          const tableId: string | undefined = response.data;
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`);
        }
      },
    },
  );

  const { trigger: sendChatMessage, isMutating: isChatMessageMutating } = useSWRMutation(
    `/api/games/towers/rooms/${roomId}/chat-messages`,
    (url: string, { arg }: { arg: { text: string } }) =>
      fetcher<TowersRoomChatMessageWithRelations>(url, { method: "POST", body: JSON.stringify(arg) }),
    {
      onSuccess(response: ApiResponse<TowersRoomChatMessageWithRelations>) {
        if (response.success) {
          messageInputRef.current?.clear();
        }
      },
    },
  );

  const { trigger: exitRoom, isMutating: isExitRoomMutating } = useSWRMutation(
    `/api/games/towers/rooms/${roomId}/players`,
    (url: string) => fetcher<void>(url, { method: "DELETE" }),
    {
      onSuccess(response: ApiResponse<void>) {
        if (response.success) {
          socketRef.current?.emit(SocketEvents.SOCKET_LEAVE, { roomId });
          removeJoinedRoom(roomId);
          setActiveRoomId(null);
          router.push(ROUTE_TOWERS.PATH);
        }
      },
    },
  );

  useEffect(() => {
    if (roomId && !isJoinedRoomRef.current) {
      joinRoom();
      isJoinedRoomRef.current = true;
    }
  }, [roomId]);

  useEffect(() => {
    if (!socketRef.current || !roomId) return;

    const handlePlayerJoinRoom = ({ roomPlayer }: { roomPlayer: TowersRoomPlayerWithRelations }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        const isPlayerExists: boolean = prev.players.some(
          (currentRoomPlayer: TowersRoomPlayerWithRelations) => currentRoomPlayer.playerId === roomPlayer.playerId,
        );
        if (isPlayerExists) return prev;

        return { ...prev, players: [...prev.players, roomPlayer] };
      });
    };

    const handlePlayerLeaveRoom = ({ roomPlayer }: { roomPlayer: TowersRoomPlayerWithRelations }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        return {
          ...prev,
          players: prev.players.filter(
            (currentRoomPlayer: TowersRoomPlayerWithRelations) => currentRoomPlayer.playerId !== roomPlayer.playerId,
          ),
        };
      });
    };

    const handleUpdateChatMessages = ({ chatMessage }: { chatMessage: TowersRoomChatMessageWithRelations }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...(prev.chatMessages ?? []), chatMessage],
        };
      });
    };

    const handlePlayerJoinTable = ({ tablePlayer }: { tablePlayer: TowersTablePlayerWithRelations }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        // Update the player’s tablesJoined in room.players
        const players: TowersRoomPlayerWithRelations[] = prev.players.map(
          (roomPlayer: TowersRoomPlayerWithRelations) => {
            if (roomPlayer.playerId === tablePlayer.playerId) {
              const isInTable: boolean = roomPlayer.player.tablesJoined.some(
                (tableJoined: TowersPlayerTablesJoined) => tableJoined.tableId === tablePlayer.tableId,
              );

              if (!isInTable) {
                return {
                  ...roomPlayer,
                  player: {
                    ...roomPlayer.player,
                    tablesJoined: [...roomPlayer.player.tablesJoined, ...tablePlayer.player.tablesJoined],
                  },
                };
              }
            }

            return roomPlayer;
          },
        );

        // Update the table’s players list
        const tables: TowersTableWithRelations[] = prev.tables.map((table: TowersTableWithRelations) => {
          if (table.id === tablePlayer.tableId) {
            const isSeated: boolean = table.players.some(
              (tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.playerId === tablePlayer.playerId,
            );

            if (!isSeated) {
              return { ...table, players: [...table.players, tablePlayer] };
            }
          }

          return table;
        });

        return { ...prev, players, tables };
      });
    };

    const handlePlayerLeaveTable = ({ tablePlayer }: { tablePlayer: TowersTablePlayerWithRelations }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        // Remove the table from the player’s joined list
        const players: TowersRoomPlayerWithRelations[] = prev.players.map(
          (roomPlayer: TowersRoomPlayerWithRelations) => {
            if (roomPlayer.playerId === tablePlayer.playerId) {
              return {
                ...roomPlayer,
                player: {
                  ...roomPlayer.player,
                  tablesJoined: roomPlayer.player.tablesJoined.filter(
                    (tableJoined: TowersPlayerTablesJoined) => tableJoined.tableId !== tablePlayer.tableId,
                  ),
                },
              };
            }

            return roomPlayer;
          },
        );

        // Remove the player from the table’s players list
        const tables: TowersTableWithRelations[] = prev.tables.map((table: TowersTableWithRelations) => {
          if (table.id === tablePlayer.tableId) {
            return {
              ...table,
              players: table.players.filter(
                (tablePlayer: TowersTablePlayerWithRelations) => tablePlayer.playerId !== tablePlayer.playerId,
              ),
            };
          }
          return table;
        });

        return { ...prev, players, tables };
      });
    };

    const handleUpdateTable = ({ table }: { table: TowersTableWithRelations }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        const existingTableIndex: number = prev.tables.findIndex(
          (currentTable: TowersTableWithRelations) => currentTable.id === table.id,
        );
        if (existingTableIndex !== -1) {
          const updatedTables: TowersTableWithRelations[] = [...prev.tables];
          updatedTables[existingTableIndex] = { ...prev.tables[existingTableIndex], ...table };
          return { ...prev, tables: updatedTables };
        }

        // Add new table
        return { ...prev, tables: [...prev.tables, table] };
      });
    };

    const handleDeleteTable = ({ tableId }: { tableId: string }): void => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        return {
          ...prev,
          tables: prev.tables.filter((currentTable: TowersTableWithRelations) => currentTable.id !== tableId),
        };
      });
    };

    const handleUpdateTableSeat = ({ tableSeat }: { tableSeat: TowersTableSeatWithRelations }) => {
      setRoom((prev: TowersRoomWithRelations | undefined) => {
        if (!prev) return prev;

        const updatedTables: TowersTableWithRelations[] = prev.tables.map((table: TowersTableWithRelations) => {
          if (table.id !== tableSeat.tableId) return table;

          const updatedSeats: TowersTableSeatWithRelations[] = table.seats.map((seat: TowersTableSeatWithRelations) =>
            seat.id === tableSeat.id ? tableSeat : seat,
          );

          return {
            ...table,
            seats: updatedSeats,
          };
        });

        return {
          ...prev,
          tables: updatedTables,
        };
      });
    };

    socketRef.current?.on(SocketEvents.ROOM_PLAYER_JOINED, handlePlayerJoinRoom);
    socketRef.current?.on(SocketEvents.ROOM_PLAYER_LEFT, handlePlayerLeaveRoom);
    socketRef.current?.on(SocketEvents.ROOM_MESSAGE_SENT, handleUpdateChatMessages);
    socketRef.current?.on(SocketEvents.TABLE_PLAYER_JOINED, handlePlayerJoinTable);
    socketRef.current?.on(SocketEvents.TABLE_PLAYER_LEFT, handlePlayerLeaveTable);
    socketRef.current?.on(SocketEvents.TABLE_UPDATED, handleUpdateTable);
    socketRef.current?.on(SocketEvents.TABLE_DELETED, handleDeleteTable);
    socketRef.current?.on(SocketEvents.TABLE_SEAT_UPDATED, handleUpdateTableSeat);

    return () => {
      socketRef.current?.off(SocketEvents.ROOM_PLAYER_JOINED, handlePlayerJoinRoom);
      socketRef.current?.off(SocketEvents.ROOM_PLAYER_LEFT, handlePlayerLeaveRoom);
      socketRef.current?.off(SocketEvents.ROOM_MESSAGE_SENT, handleUpdateChatMessages);
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_JOINED, handlePlayerJoinTable);
      socketRef.current?.off(SocketEvents.TABLE_PLAYER_LEFT, handlePlayerLeaveTable);
      socketRef.current?.off(SocketEvents.TABLE_UPDATED, handleUpdateTable);
      socketRef.current?.off(SocketEvents.TABLE_DELETED, handleDeleteTable);
      socketRef.current?.off(SocketEvents.TABLE_SEAT_UPDATED, handleUpdateTableSeat);
    };
  }, [roomId, isConnected]);

  const handlePlayNow = async (): Promise<void> => {
    await playNow();
  };

  const handleCreateTable = (): void => {
    openModal(CreateTableModal, {
      roomId,
      onCreateTableSuccess: (tableId: string): void => {
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`);
      },
    });
  };

  const handleExitRoom = async (): Promise<void> => {
    await exitRoom();
  };

  const handleSendMessage = async (event: KeyboardEvent<HTMLInputElement>): Promise<void> => {
    if (event.code === "Enter" && messageInputRef.current?.value) {
      const text: string = messageInputRef.current.value.trim();

      if (text !== "") {
        await sendChatMessage({ text });
      }
    }
  };

  return (
    <div
      className={clsx(
        "grid [grid-template-areas:'banner_banner_banner''sidebar_content_content''sidebar_content_content'] grid-rows-(--grid-rows-game) grid-cols-(--grid-cols-game) h-screen -m-4 -mb-8 bg-gray-100",
        "dark:bg-dark-game-background",
      )}
    >
      <RoomHeader room={room} />

      {/* Left sidebar */}
      <div
        className={clsx(
          "[grid-area:sidebar] flex flex-col justify-between p-2 bg-gray-200",
          "dark:bg-dark-game-sidebar-background",
        )}
      >
        <div className="mb-4">
          <Button className="w-full py-2 mb-2" disabled={!isConnected || isPlayNowMutating} onClick={handlePlayNow}>
            <Trans>Play Now</Trans>
          </Button>
          <Button className="w-full py-2 mb-2" disabled={!isConnected} onClick={handleCreateTable}>
            <Trans>Create Table</Trans>
          </Button>
        </div>
        <div className="mt-4">
          {room && room?.level !== RoomLevel.SOCIAL && (
            <>
              <div>
                <span className="p-1 rounded-tl-sm rounded-tr-sm bg-sky-700 text-white text-sm">
                  <Trans>Ratings</Trans>
                </span>
              </div>
              <div
                className={clsx(
                  "flex flex-col gap-4 p-2 bg-white text-gray-600 mb-4",
                  "dark:border-dark-card-border dark:bg-dark-card-background dark:text-gray-200",
                )}
              >
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-400"></div>
                  <div>{RATING_MASTER}+</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-orange-400"></div>
                  <div>
                    {RATING_DIAMOND}-{RATING_MASTER - 1}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-purple-400"></div>
                  <div>
                    {RATING_PLATINUM}-{RATING_DIAMOND - 1}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-cyan-600"></div>
                  <div>
                    {RATING_GOLD}-{RATING_PLATINUM - 1}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-600"></div>
                  <div>
                    {RATING_SILVER}-{RATING_GOLD - 1}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-400"></div>
                  <div>
                    <Trans>provisional</Trans>
                  </div>
                </div>
              </div>
            </>
          )}
          <Button
            className="w-full py-2 mb-2"
            disabled={!isConnected || true}
            onClick={(_: MouseEvent<HTMLButtonElement>) => {}}
          >
            <Trans>Options</Trans>
          </Button>
          <Button className="w-full py-2 mb-2" disabled={!isConnected || isExitRoomMutating} onClick={handleExitRoom}>
            <Trans>Exit Room</Trans>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="[grid-area:content] grid [grid-template-areas:'tables''chat'] grid-rows-(--grid-rows-game-content) gap-2 px-2 pb-2">
        {/* Tables */}
        <div
          className={clsx(
            "[grid-area:tables] overflow-hidden flex flex-col border border-gray-200 bg-white",
            "dark:border-dark-game-content-border dark:bg-dark-game-content-background",
          )}
        >
          <div
            className={clsx("flex gap-1 py-2 bg-yellow-200 text-black", "dark:bg-dark-game-yellow-sub-bar-background")}
          >
            <div className="flex justify-center items-center w-16 border-gray-300">
              <Trans>Table</Trans>
            </div>
            <div className="flex justify-center items-center w-28 border-gray-300"></div>
            <div className="flex justify-center items-center w-28 border-gray-300">
              <Trans>Team 1-2</Trans>
            </div>
            <div className="flex justify-center items-center w-28 border-gray-300">
              <Trans>Team 3-4</Trans>
            </div>
            <div className="flex justify-center items-center w-28 border-gray-300">
              <Trans>Team 5-6</Trans>
            </div>
            <div className="flex justify-center items-center w-28 border-gray-300">
              <Trans>Team 7-8</Trans>
            </div>
            <div className="flex-1 px-2">
              <Trans>Who is Watching</Trans>
            </div>
          </div>
          <div className="overflow-y-auto">
            {isJoinRoomMutating || !room?.tables ? (
              <>
                {Array.from({ length: 50 }).map((_, index: number) => (
                  <RoomTableSkeleton key={index} />
                ))}
              </>
            ) : (
              <>
                {room?.tables.map((table: TowersTableWithRelations) => (
                  <RoomTable
                    key={table.id}
                    roomId={roomId}
                    table={table}
                    roomPlayer={room?.players.find(
                      (roomPlayer: TowersRoomPlayerWithRelations) => roomPlayer.player.id === session?.user.id,
                    )}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Chat and users list */}
        <div className="[grid-area:chat] flex gap-2">
          <div
            className={clsx(
              "overflow-hidden flex-1 flex flex-col gap-1 border border-gray-200 bg-white",
              "dark:border-dark-game-content-border dark:bg-dark-game-chat-background",
            )}
          >
            <ServerMessage roomId={roomId} />

            {/* Chat */}
            <div className="overflow-hidden flex flex-col gap-1 h-full px-2">
              <Chat
                chat={room?.chatMessages}
                messageInputRef={messageInputRef}
                isMessageInputDisabled={!isConnected || isChatMessageMutating}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>

          <div className="w-[385px]">
            <PlayersList
              roomId={roomId}
              players={room?.players}
              isRatingsVisible={room && room?.level !== RoomLevel.SOCIAL}
              isTableNumberVisible
            />
          </div>
        </div>
      </div>
    </div>
  );
}
