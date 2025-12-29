"use client";

import { KeyboardEvent, ReactNode, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";
import { ProfanityFilter, RoomLevel } from "db/browser";
import { Socket } from "socket.io-client";
import useSWR from "swr";
import CreateTableModal from "@/components/game/CreateTableModal";
import GameOptionsModal from "@/components/game/GameOptionsModal";
import ChatSkeleton from "@/components/skeleton/ChatSkeleton";
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton";
import RoomHeaderSkeleton from "@/components/skeleton/RoomHeaderSkeleton";
import RoomTableSkeleton from "@/components/skeleton/RoomTableSkeleton";
import ServerMessageSkeleton from "@/components/skeleton/ServerMessageSkeleton";
import Button from "@/components/ui/Button";
import { InputImperativeHandle } from "@/components/ui/Input";
import { RATING_DIAMOND, RATING_GOLD, RATING_MASTER, RATING_PLATINUM, RATING_SILVER } from "@/constants/game";
import { ROUTE_TOWERS } from "@/constants/routes";
import { ClientToServerEvents } from "@/constants/socket/client-to-server";
import { ServerToClientEvents } from "@/constants/socket/server-to-client";
import { useGame } from "@/context/GameContext";
import { useModal } from "@/context/ModalContext";
import { useSocket } from "@/context/SocketContext";
import { SocketCallback } from "@/interfaces/socket";
import { fetcher } from "@/lib/fetcher";
import { RoomPlainObject } from "@/server/towers/classes/Room";
import { RoomChatMessagePlainObject } from "@/server/towers/classes/RoomChatMessage";
import { RoomPlayerPlainObject } from "@/server/towers/classes/RoomPlayer";
import { TablePlainObject } from "@/server/towers/classes/Table";
import { TablePlayerPlainObject } from "@/server/towers/classes/TablePlayer";
import { TableSeatPlainObject } from "@/server/towers/classes/TableSeat";

const RoomHeader = dynamic(() => import("@/components/game/RoomHeader"), {
  loading: () => <RoomHeaderSkeleton />,
});

const ServerMessage = dynamic(() => import("@/components/game/ServerMessage"), {
  ssr: false,
  loading: () => <ServerMessageSkeleton />,
});

const RoomTable = dynamic(() => import("@/components/game/RoomTable"), {
  loading: () => <RoomTableSkeleton />,
});

const Chat = dynamic(() => import("@/components/game/Chat"), {
  loading: () => <ChatSkeleton />,
});

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
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
  const { addJoinedRoom, removeJoinedRoom } = useGame();
  const { openModal } = useModal();
  const joinedRoomSidebarRef = useRef<Set<string>>(new Set<string>());
  const messageInputRef = useRef<InputImperativeHandle>(null);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [room, setRoom] = useState<RoomPlainObject>();
  const [avatarId, setAvatarId] = useState<string>("001");
  const [profanityFilter, setProfanityFilter] = useState<ProfanityFilter>(ProfanityFilter.WEAK);

  const {
    data: roomResponse,
    error: roomError,
    mutate: loadRoom,
  } = useSWR<ApiResponse<RoomPlainObject>>(`/api/games/towers/rooms/${roomId}`, fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: true,
  });

  const { data: settingsResponse } = useSWR<ApiResponse<{ avatarId: string; profanityFilter: ProfanityFilter }>>(
    `/api/users/${session?.user.id}/settings`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useEffect(() => {
    if (room && !joinedRoomSidebarRef.current.has(room.id)) {
      joinedRoomSidebarRef.current.add(room.id);
      addJoinedRoom({ id: room.id, name: room.name, basePath: ROUTE_TOWERS.PATH });
    }
  }, [room]);

  useEffect(() => {
    if (roomResponse?.success && roomResponse.data) {
      setRoom(roomResponse.data);
    }
  }, [roomResponse]);

  useEffect(() => {
    if ((settingsResponse?.success, settingsResponse?.data)) {
      setAvatarId(settingsResponse.data.avatarId);
      setProfanityFilter(settingsResponse.data.profanityFilter);
    }
  }, [settingsResponse?.data]);

  useEffect(() => {
    if (!isConnected || !socketRef.current) return;

    const socket: Socket | null = socketRef.current;

    const emitInitialData = (): void => {
      socket.emit(ClientToServerEvents.ROOM_JOIN, { roomId }, (response: SocketCallback<RoomPlainObject>) => {
        if (response.success && response.data) {
          setIsJoined(true);
          setRoom(response.data); // await loadRoom(); // TODO: Switch to loadRoom when db logic will be implemented
        } else {
          router.push(ROUTE_TOWERS.PATH);
        }
      });
    };

    const handlePlayerJoinRoom = ({ roomPlayer }: { roomPlayer: RoomPlayerPlainObject }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        const isPlayerExists: boolean = prev.players.some(
          (rp: RoomPlayerPlainObject) => rp.playerId === roomPlayer.playerId,
        );
        if (isPlayerExists) return prev;

        return { ...prev, players: [...prev.players, roomPlayer] };
      });
    };

    const handlePlayerLeaveRoom = ({ roomPlayer }: { roomPlayer: RoomPlayerPlainObject }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        return {
          ...prev,
          players: prev.players.filter((rp: RoomPlayerPlainObject) => rp.playerId !== roomPlayer.playerId),
        };
      });
    };

    const handleUpdateChatMessages = ({ chatMessage }: { chatMessage: RoomChatMessagePlainObject }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...(prev.chatMessages ?? []), chatMessage],
        };
      });
    };

    const handleUpdateTable = ({ table }: { table: TablePlainObject }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        const existingTableIndex: number = prev.tables.findIndex((t: TablePlainObject) => t.id === table.id);
        if (existingTableIndex !== -1) {
          const updatedTables: TablePlainObject[] = [...prev.tables];
          updatedTables[existingTableIndex] = { ...prev.tables[existingTableIndex], ...table };
          return { ...prev, tables: updatedTables };
        }

        // Add new table
        return { ...prev, tables: [...prev.tables, table] };
      });
    };

    const handleUpdateTableSeat = ({ tableSeat }: { tableSeat: TableSeatPlainObject }) => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        const updatedTables: TablePlainObject[] = prev.tables.map((table: TablePlainObject) => {
          if (table.id !== tableSeat.tableId) return table;

          return {
            ...table,
            seats: table.seats.map((ts: TableSeatPlainObject) => (ts.id === tableSeat.id ? tableSeat : ts)),
          };
        });

        return { ...prev, tables: updatedTables };
      });
    };

    const handlePlayerJoinTable = ({ tablePlayer }: { tablePlayer: TablePlayerPlainObject }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        // Update the table’s players list
        const tables: TablePlainObject[] = prev.tables.map((table: TablePlainObject) => {
          if (table.id === tablePlayer.tableId) {
            const isSeated: boolean = table.players.some(
              (tp: TablePlayerPlainObject) => tp.playerId === tablePlayer.playerId,
            );

            if (!isSeated) {
              return {
                ...table,
                players: [...table.players, { ...tablePlayer, tableNumber: tablePlayer.table.tableNumber }],
              };
            }
          }

          return table;
        });

        // Update player to room's player list
        let players: RoomPlayerPlainObject[] = [];
        const existingPlayerIndex: number = prev.players.findIndex(
          (rp: RoomPlayerPlainObject) => rp.playerId === tablePlayer.playerId,
        );

        if (existingPlayerIndex !== -1) {
          players = prev.players.map((rp: RoomPlayerPlainObject, index: number) => {
            if (index === existingPlayerIndex) {
              return {
                ...rp,
                tableNumber: tablePlayer.table.tableNumber,
              };
            }

            return rp;
          });
        }

        return { ...prev, tables, players };
      });
    };

    const handlePlayerLeaveTable = ({ tablePlayer }: { tablePlayer: TablePlayerPlainObject }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        // Remove the player from the table’s players list
        const tables: TablePlainObject[] = prev.tables.map((table: TablePlainObject) => {
          if (table.id === tablePlayer.tableId) {
            return {
              ...table,
              players: table.players.filter((tp: TablePlayerPlainObject) => tp.playerId !== tablePlayer.playerId),
            };
          }

          return table;
        });

        // Update player in room's player list - set tableNumber to null
        const players: RoomPlayerPlainObject[] = prev.players.map((rp: RoomPlayerPlainObject) => {
          if (rp.playerId === tablePlayer.playerId) {
            return {
              ...rp,
              tableNumber: null,
            };
          }

          return rp;
        });

        return { ...prev, tables, players };
      });
    };

    const handleDeleteTable = ({ tableId }: { tableId: string }): void => {
      setRoom((prev: RoomPlainObject | undefined) => {
        if (!prev) return prev;

        return {
          ...prev,
          tables: prev.tables.filter((t: TablePlainObject) => t.id !== tableId),
        };
      });
    };

    const attachListeners = (): void => {
      socket.on(ServerToClientEvents.ROOM_PLAYER_JOINED, handlePlayerJoinRoom);
      socket.on(ServerToClientEvents.ROOM_PLAYER_LEFT, handlePlayerLeaveRoom);
      socket.on(ServerToClientEvents.ROOM_MESSAGE_SENT, handleUpdateChatMessages);
      socket.on(ServerToClientEvents.TABLE_UPDATED, handleUpdateTable);
      socket.on(ServerToClientEvents.TABLE_SEAT_UPDATED, handleUpdateTableSeat);
      socket.on(ServerToClientEvents.TABLE_PLAYER_JOINED, handlePlayerJoinTable);
      socket.on(ServerToClientEvents.TABLE_PLAYER_LEFT, handlePlayerLeaveTable);
      socket.on(ServerToClientEvents.TABLE_DELETED, handleDeleteTable);
    };

    const onConnect = (): void => {
      attachListeners();
      if (!isJoined) emitInitialData();
    };

    const onReconnect = (): void => {
      if (!isJoined) emitInitialData();
    };

    if (socket.connected) onConnect();
    else socket.once("connect", onConnect);

    socket.on("reconnect", onReconnect);

    return () => {
      socket.off(ServerToClientEvents.ROOM_PLAYER_JOINED, handlePlayerJoinRoom);
      socket.off(ServerToClientEvents.ROOM_PLAYER_LEFT, handlePlayerLeaveRoom);
      socket.off(ServerToClientEvents.ROOM_MESSAGE_SENT, handleUpdateChatMessages);
      socket.off(ServerToClientEvents.TABLE_UPDATED, handleUpdateTable);
      socket.off(ServerToClientEvents.TABLE_SEAT_UPDATED, handleUpdateTableSeat);
      socket.off(ServerToClientEvents.TABLE_PLAYER_JOINED, handlePlayerJoinTable);
      socket.off(ServerToClientEvents.TABLE_PLAYER_LEFT, handlePlayerLeaveTable);
      socket.off(ServerToClientEvents.TABLE_DELETED, handleDeleteTable);
      socket.off("reconnect", onReconnect);
    };
  }, [isConnected, socketRef, roomId, isJoined]);

  const handlePlayNow = (): void => {
    socketRef.current?.emit(
      ClientToServerEvents.TABLE_PLAY_NOW,
      { roomId },
      (response: SocketCallback<{ tableId: string }>): void => {
        if (response.success) {
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${response.data?.tableId}`);
        }
      },
    );
  };

  const handleOpenCreateTableModal = (): void => {
    openModal(CreateTableModal, {
      roomId,
      onCreateTableSuccess: (tableId: string): void => {
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`);
      },
    });
  };

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current?.value) {
      const text: string = messageInputRef.current.value.trim();

      if (text !== "") {
        socketRef.current?.emit(
          ClientToServerEvents.ROOM_MESSAGE_SEND,
          { roomId, text },
          (response: SocketCallback) => {
            if (response.success) {
              messageInputRef.current?.clear();
            }
          },
        );
      }
    }
  };

  const handleOpenOptionsModal = () => {
    openModal(GameOptionsModal, {
      avatarId,
      profanityFilter,
      onSetProfanityFilter: (value: ProfanityFilter) => setProfanityFilter(value),
    });
  };

  const handleExitRoom = (): void => {
    socketRef.current?.emit(ClientToServerEvents.ROOM_LEAVE, { roomId }, (response: SocketCallback<void>) => {
      if (response.success) {
        removeJoinedRoom(roomId);
        router.push(ROUTE_TOWERS.PATH);
      }
    });
  };

  if (roomError) return <div>Error: {roomError.message}</div>;

  return (
    <>
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
            <Button className="w-full py-2 mb-2" onClick={handlePlayNow}>
              <Trans>Play Now</Trans>
            </Button>
            <Button className="w-full py-2 mb-2" onClick={handleOpenCreateTableModal}>
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
            <Button className="w-full py-2 mb-2" onClick={handleOpenOptionsModal}>
              <Trans>Options</Trans>
            </Button>
            <Button className="w-full py-2 mb-2" onClick={handleExitRoom}>
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
              className={clsx(
                "flex gap-1 py-2 bg-yellow-200 text-black",
                "dark:bg-dark-game-yellow-sub-bar-background",
              )}
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
              {room?.tables.map((table: TablePlainObject) => (
                <RoomTable
                  key={table.id}
                  roomId={roomId}
                  table={table}
                  roomPlayer={room?.players.find((rp: RoomPlayerPlainObject) => rp.playerId === session?.user.id)}
                />
              ))}
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
              <ServerMessage />

              {/* Chat */}
              <div className="overflow-hidden flex flex-col gap-1 h-full px-2">
                <Chat
                  chatMessages={room?.chatMessages}
                  messageInputRef={messageInputRef}
                  isMessageInputDisabled={!isConnected}
                  profanityFilter={profanityFilter}
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
    </>
  );
}
