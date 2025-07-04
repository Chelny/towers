"use client"

import { KeyboardEvent, MouseEvent, ReactNode, RefObject, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { RoomLevel } from "@prisma/client"
import clsx from "clsx/lite"
import CreateTableModal from "@/components/game/CreateTableModal"
import JoiningScreen from "@/components/game/JoiningScreen"
import ServerMessage from "@/components/game/ServerMessage"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import RoomHeaderSkeleton from "@/components/skeleton/RoomHeaderSkeleton"
import RoomTableSkeleton from "@/components/skeleton/RoomTableSkeleton"
import Button from "@/components/ui/Button"
import { RATING_DIAMOND, RATING_GOLD, RATING_MASTER, RATING_PLATINUM, RATING_SILVER } from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useGame } from "@/context/GameContext"
import { useModal } from "@/context/ModalContext"
import { useSocket } from "@/context/SocketContext"
import { authClient } from "@/lib/auth-client"
import { RoomPlainObject } from "@/server/towers/classes/Room"
import { TablePlainObject } from "@/server/towers/classes/Table"
import { UserPlainObject } from "@/server/towers/classes/User"

const RoomHeader = dynamic(() => import("@/components/game/RoomHeader"), {
  loading: () => <RoomHeaderSkeleton />,
})

const RoomTable = dynamic(() => import("@/components/game/RoomTable"), {
  loading: () => <RoomTableSkeleton />,
})

const Chat = dynamic(() => import("@/components/game/Chat"), {
  loading: () => <ChatSkeleton />,
})

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton isTableNumberVisible />,
})

export default function Room(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()

  const roomId: string | null = searchParams.get("room")

  if (!roomId) {
    throw new Error("Room ID is required")
  }

  const { t } = useLingui()
  const { data: session } = authClient.useSession()
  const { socket, isConnected } = useSocket()
  const { addJoinedRoom, removeJoinedRoom } = useGame()
  const { openModal } = useModal()
  const hasJoinedRef: React.RefObject<boolean> = useRef<boolean>(false)
  const [hasJoined, setHasJoined] = useState<boolean>(false)
  const joinedRoomSidebarRef = useRef<Set<string>>(new Set<string>())
  const messageInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const [room, setRoom] = useState<RoomPlainObject>()
  const isDone: boolean = hasJoined && !!room

  useEffect(() => {
    if (!socket || !roomId || hasJoinedRef.current) return

    hasJoinedRef.current = true

    socket.emit(SocketEvents.ROOM_JOIN, { roomId }, (response: { success: boolean; message: string }): void => {
      if (response.success) {
        socket.emit(SocketEvents.ROOM_GET, { roomId })
        setHasJoined(true)
      } else {
        router.push(ROUTE_TOWERS.PATH)
      }
    })
  }, [socket, roomId])

  useEffect(() => {
    if (!socket || !roomId || !hasJoinedRef.current) return

    const handleRoomData = ({ room }: { room: RoomPlainObject }): void => {
      setRoom(room)
    }

    const handleRoomUpdate = (): void => {
      socket.emit(SocketEvents.ROOM_GET, { roomId })
    }

    socket.on(SocketEvents.ROOM_DATA, handleRoomData)
    socket.on(SocketEvents.ROOM_DATA_UPDATED, handleRoomUpdate)
    socket.on(SocketEvents.ROOM_CHAT_UPDATED, handleRoomUpdate)
    socket.on(SocketEvents.ROOM_TABLE_ADDED, handleRoomUpdate)

    return () => {
      socket.off(SocketEvents.ROOM_DATA, handleRoomData)
      socket.off(SocketEvents.ROOM_DATA_UPDATED, handleRoomUpdate)
      socket.off(SocketEvents.ROOM_CHAT_UPDATED, handleRoomUpdate)
      socket.off(SocketEvents.ROOM_TABLE_ADDED, handleRoomUpdate)
    }
  }, [socket, roomId, hasJoinedRef.current])

  useEffect(() => {
    if (room && !joinedRoomSidebarRef.current.has(room.id)) {
      addJoinedRoom({ id: room.id, name: room.name, basePath: ROUTE_TOWERS.PATH })
      joinedRoomSidebarRef.current.add(room.id)
    }
  }, [room])

  const handlePlayNow = (): void => {
    socket?.emit(
      SocketEvents.TABLE_PLAY_NOW,
      { roomId },
      (response: { success: boolean; message: string; data: { tableId: string } }): void => {
        if (response.success) {
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${response.data.tableId}`)
        }
      },
    )
  }

  const handleOpenCreateTableModal = (): void => {
    openModal(CreateTableModal, {
      roomId,
      onCreateTableSuccess: handleCreateTableSuccess,
    })
  }

  const handleCreateTableSuccess = (tableId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`)
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.code === "Enter" && messageInputRef.current) {
      const text: string = messageInputRef.current.value.trim()

      if (socket && text !== "") {
        socket.emit(SocketEvents.ROOM_MESSAGE_SEND, { roomId, text })
      }
    }
  }

  const handleExitRoom = (): void => {
    socket?.emit(SocketEvents.ROOM_LEAVE, { roomId }, (response: { success: boolean; message: string }) => {
      if (response.success) {
        removeJoinedRoom(roomId)
        router.push(ROUTE_TOWERS.PATH)
      }
    })
  }

  if (!hasJoined || !room) {
    return (
      <JoiningScreen
        title={t({ message: "Joining room" })}
        subtitle={t({ message: "Please wait while we connect you to the room..." })}
        isDone={isDone}
        onCancel={() => router.push(ROUTE_TOWERS.PATH)}
      />
    )
  }

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
            <Button className="w-full py-2 mb-2" disabled onClick={(_: MouseEvent<HTMLButtonElement>) => {}}>
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
                  user={room?.users.find((u: UserPlainObject) => u.user?.id === session?.user.id)}
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
              <ServerMessage roomId={roomId} />

              {/* Chat */}
              <div className="overflow-hidden flex flex-col gap-1 h-full px-2">
                <Chat
                  chat={room?.chat}
                  messageInputRef={messageInputRef}
                  isMessageInputDisabled={!isConnected}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>

            <div className="w-[385px]">
              <PlayersList
                users={room?.users}
                isRatingsVisible={room && room?.level !== RoomLevel.SOCIAL}
                isTableNumberVisible
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
