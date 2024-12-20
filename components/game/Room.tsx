"use client"

import { KeyboardEvent, memo, MouseEvent, ReactNode, RefObject, useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersTableWithRelations,
  ITowersUserRoomTable,
  RoomLevel,
} from "@prisma/client"
import CreateTable from "@/components/game/CreateTable"
import ServerMessage from "@/components/game/ServerMessage"
import TableInvitation, { TableInvitationData } from "@/components/game/TableInvitation"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import RoomHeaderSkeleton from "@/components/skeleton/RoomHeaderSkeleton"
import RoomTableSkeleton from "@/components/skeleton/RoomTableSkeleton"
import Button from "@/components/ui/Button"
import {
  CHAT_MESSSAGE_MAX_LENGTH,
  RATING_DIAMOND,
  RATING_GOLD,
  RATING_MASTER,
  RATING_PLATINUM,
  RATING_SILVER,
} from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { TowersTableState } from "@/interfaces/socket"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addLink, removeLink } from "@/redux/features/sidebar-slice"
import { addTable, joinRoomSocketRoom, leaveRoomSocketRoom, sendRoomChatMessage } from "@/redux/features/socket-slice"
import {
  selectIsRoomChatLoading,
  selectIsRoomInfoLoading,
  selectRoomChat,
  selectRoomInfo,
  selectRoomIsJoined,
  selectRoomTables,
  selectRoomUsers,
} from "@/redux/selectors/socket-selectors"
import { AppDispatch, RootState } from "@/redux/store"
import {
  fetchRoomChat,
  fetchRoomInfo,
  fetchRoomTables,
  fetchRoomUsers,
  joinRoom,
  leaveRoom,
  SocketRoomThunkResponse,
} from "@/redux/thunks/room-thunks"

type RoomProps = {
  roomId: string
}

const areEqual = (prevProps: RoomProps, nextProps: RoomProps): boolean => {
  return prevProps.roomId === nextProps.roomId
}

export default memo(function Room({ roomId }: RoomProps): ReactNode {
  const router = useRouter()
  const { data: session, isPending, error } = authClient.useSession()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const isJoinedRoom: boolean = useAppSelector((state: RootState) => selectRoomIsJoined(state, roomId))
  const roomInfo: ITowersRoom | null = useAppSelector((state: RootState) => selectRoomInfo(state, roomId))
  const isInfoLoading: boolean = useAppSelector((state: RootState) => selectIsRoomInfoLoading(state, roomId))
  const chat: ITowersRoomChatMessage[] = useAppSelector((state: RootState) => selectRoomChat(state, roomId))
  const isChatLoading: boolean = useAppSelector((state: RootState) => selectIsRoomChatLoading(state, roomId))
  const roomUsers: ITowersUserRoomTable[] = useAppSelector((state: RootState) => selectRoomUsers(state, roomId))
  const tables: TowersTableState[] = useAppSelector((state: RootState) => selectRoomTables(state, roomId))
  const dispatch: AppDispatch = useAppDispatch()
  const messageInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const chatEndRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null)
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState<boolean>(false)
  const [invitationModals, setInvitationModals] = useState<{ id: string; data: TableInvitationData }[]>([])

  const initializeRoom = useCallback(
    (signal: AbortSignal): void => {
      if (!isJoinedRoom) {
        dispatch(joinRoom({ roomId }))
          .unwrap()
          .then((data: SocketRoomThunkResponse) => {
            if (data.towersUserRoomTable) {
              dispatch(joinRoomSocketRoom({ roomId, towersUserRoomTable: data.towersUserRoomTable }))
            }

            // Fetch room data
            dispatch(fetchRoomInfo({ roomId, signal }))
            dispatch(fetchRoomChat({ roomId, signal }))
            dispatch(fetchRoomUsers({ roomId, signal }))
            dispatch(fetchRoomTables({ roomId, signal }))
          })
      }
    },
    [isJoinedRoom],
  )

  useEffect(() => {
    const abortController: AbortController = new AbortController()
    const { signal } = abortController

    if (roomId && isConnected) {
      initializeRoom(signal)
    }

    return () => {
      abortController.abort()
    }
  }, [roomId, isConnected])

  useEffect(() => {
    if (roomInfo) {
      dispatch(
        addLink({
          href: `${ROUTE_TOWERS.PATH}?room=${roomId}`,
          label: roomInfo.name,
        }),
      )
    }
  }, [roomInfo])

  useEffect(() => {
    scrollChatToBottom()
  }, [chat])

  const openInvitationModal = (id: string, data: TableInvitationData): void => {
    setInvitationModals((prev: { id: string; data: TableInvitationData }[]) => [...prev, { id, data }])
    // openInvitationModal(createId(), { user: { username: "the_player1" }, table: { tableId: 67 } })
  }

  const handleCloseInvitationModal = (id: string): void => {
    setInvitationModals((prev: { id: string; data: TableInvitationData }[]) =>
      prev.filter((modal: { id: string; data: TableInvitationData }) => modal.id !== id),
    )
  }

  const handleAcceptInvitationModal = (modalId: string, tableId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`)
    handleCloseInvitationModal(modalId)
  }

  const handleOpenCreateTableModal = (): void => setIsCreateTableModalOpen(true)
  const handleCloseCreateTableModal = (): void => setIsCreateTableModalOpen(false)

  const handleCreateTableSuccess = (table: ITowersTableWithRelations): void => {
    dispatch(addTable({ roomId, info: table }))
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${table.id}`)
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current) {
      const message: string = messageInputRef.current.value.trim()

      if (message !== "") {
        dispatch(sendRoomChatMessage({ roomId, message }))
        messageInputRef.current.value = ""
      }
    }
  }

  const scrollChatToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" })
  }

  const handleExitRoom = (): void => {
    const tablesToQuit: { id: string; isLastUser: boolean }[] = tables
      ?.filter((table: TowersTableState) =>
        table.users?.some(
          (userRoomTable: ITowersUserRoomTable) =>
            userRoomTable.userProfile?.userId === session?.user.id && userRoomTable.roomId === roomId,
        ),
      )
      .map((table: TowersTableState) => ({
        id: (table.info as ITowersTable).id,
        isLastUser: table.users.length === 1,
      }))

    dispatch(leaveRoom({ roomId }))
      .unwrap()
      .then(() => {
        dispatch(leaveRoomSocketRoom({ roomId, tablesToQuit }))
        dispatch(removeLink(`${ROUTE_TOWERS.PATH}?room=${roomId}`))
        router.push(ROUTE_TOWERS.PATH)
      })
  }

  return (
    <>
      <div className="flex flex-col h-screen -m-4 bg-gray-100 text-black">
        <RoomHeader room={roomInfo} />

        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar */}
          <div className="flex flex-col justify-between w-52 p-4 bg-gray-200">
            <div className="mb-4">
              <Button className="w-full py-2 mb-2" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
                Play Now
              </Button>
              <Button className="w-full py-2 mb-2" disabled={isInfoLoading} onClick={handleOpenCreateTableModal}>
                Create Table
              </Button>
            </div>
            <div className="mt-4">
              {roomInfo && roomInfo?.difficulty !== RoomLevel.SOCIAL && (
                <>
                  <div>
                    <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">Ratings</span>
                  </div>
                  <div className="flex flex-col gap-4 p-2 bg-white text-gray-600 mb-4">
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
                      <div>provisional</div>
                    </div>
                  </div>
                </>
              )}
              <Button className="w-full py-2 mb-2" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
                Options
              </Button>
              <Button className="w-full py-2 mb-2" onClick={handleExitRoom}>
                Exit Room
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-2 px-2 pb-2">
            {/* Tables */}
            <div className="flex-1 flex flex-col overflow-hidden border bg-white">
              <div className="flex gap-1 bg-yellow-200 py-2">
                <div className="basis-20 px-2 border-gray-300 text-center">Table</div>
                <div className="basis-32 px-2 border-gray-300"></div>
                <div className="basis-36 px-2 border-gray-300 text-center">Team 1-2</div>
                <div className="basis-36 px-2 border-gray-300 text-center">Team 3-4</div>
                <div className="basis-36 px-2 border-gray-300 text-center">Team 5-6</div>
                <div className="basis-36 px-2 border-gray-300 text-center">Team 7-8</div>
                <div className="flex-1 px-2">Who is Watching</div>
              </div>
              <div className="flex-1 flex flex-col overflow-y-auto">
                {tables?.map(
                  (table: TowersTableState) =>
                    table?.info?.id && <RoomTable key={table?.info?.id} roomId={roomId} tableId={table?.info?.id} />,
                )}
              </div>
            </div>

            {/* Chat and users list */}
            <div className="flex gap-2 h-96 p-2 border bg-white">
              <div className="flex-1 flex flex-col">
                <ServerMessage roomId={roomId} />

                {/* Chat */}
                <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                  <input
                    ref={messageInputRef}
                    type="text"
                    className="w-full p-2 border"
                    placeholder="Write something..."
                    maxLength={CHAT_MESSSAGE_MAX_LENGTH}
                    disabled={isChatLoading}
                    onKeyDown={handleSendMessage}
                  />
                  <div className="flex-1 overflow-y-auto p-1 my-1">
                    <Chat messages={chat} />
                    <div ref={chatEndRef} />
                  </div>
                </div>
              </div>

              <div className="w-1/4 lg:w-96 overflow-hidden">
                <PlayersList
                  users={roomUsers}
                  full
                  isRatingsVisible={roomInfo && roomInfo?.difficulty !== RoomLevel.SOCIAL}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTable
        isOpen={isCreateTableModalOpen}
        roomId={roomId}
        onSubmitSuccess={handleCreateTableSuccess}
        onCancel={handleCloseCreateTableModal}
      />

      {invitationModals.map((modal: { id: string; data: TableInvitationData }) => (
        <TableInvitation
          key={modal.id}
          isOpen={true}
          data={modal.data}
          onAcceptInvitation={(tableId: string) => handleAcceptInvitationModal(modal.id, tableId)}
          onCancel={() => handleCloseInvitationModal(modal.id)}
        />
      ))}
    </>
  )
}, areEqual)

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
  loading: () => <PlayersListSkeleton full />,
})
