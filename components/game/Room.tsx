"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  ITowersRoom,
  ITowersRoomChatMessage,
  ITowersTable,
  ITowersUserProfile,
  ITowersUserProfileWithRelations,
  RoomLevel
} from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
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
  RATING_SILVER
} from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addLink, removeLink } from "@/redux/features/sidebar-slice"
import { addTable, joinRoomSocketRoom, leaveRoomSocketRoom, sendRoomChatMessage } from "@/redux/features/socket-slice"
import {
  selectIsRoomChatLoading,
  selectIsRoomInfoLoading,
  selectIsRoomTablesLoading,
  selectRoomChat,
  selectRoomInfo,
  selectRoomTables,
  selectRoomUsers
} from "@/redux/selectors/socket-selectors"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchRoomChat, fetchRoomInfo, fetchRoomTables, fetchRoomUsers, leaveRoom } from "@/redux/thunks/room-thunks"
import { joinTable } from "@/redux/thunks/table-thunks"

type RoomProps = {
  roomId: string
}

export default function Room({ roomId }: RoomProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { data: session } = useSessionData()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const roomInfo: ITowersRoom | null = useAppSelector((state: RootState) => selectRoomInfo(state, roomId))
  const isRoomInfoLoading: boolean = useAppSelector((state: RootState) => selectIsRoomInfoLoading(state, roomId))
  const roomTables: ITowersTable[] = useAppSelector((state: RootState) => selectRoomTables(state, roomId))
  const isRoomTablesLoading: boolean = useAppSelector((state: RootState) => selectIsRoomTablesLoading(state, roomId))
  const chat: ITowersRoomChatMessage[] = useAppSelector((state: RootState) => selectRoomChat(state, roomId))
  const isChatLoading: boolean = useAppSelector((state: RootState) => selectIsRoomChatLoading(state, roomId))
  const roomUsers: ITowersUserProfile[] = useAppSelector((state: RootState) => selectRoomUsers(state, roomId))
  const dispatch: AppDispatch = useAppDispatch()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState<boolean>(false)
  const [invitationModals, setInvitationModals] = useState<{ id: string; data: TableInvitationData }[]>([])

  // openInvitationModal(uuidv4(), { user: { username: "the_player1" }, table: { tableId: 67 } })

  useEffect(() => {
    if (isConnected) {
      dispatch(joinRoomSocketRoom({ roomId }))
    }
  }, [roomId, isConnected])

  useEffect(() => {
    if (isConnected) {
      const abortController: AbortController = new AbortController()
      const { signal } = abortController

      dispatch(fetchRoomInfo({ roomId, signal }))
      dispatch(fetchRoomTables({ roomId, signal }))
      dispatch(fetchRoomChat({ roomId, signal }))
      dispatch(fetchRoomUsers({ roomId, signal }))

      return () => {
        abortController.abort()
      }
    }
  }, [roomId, isConnected])

  useEffect(() => {
    if (isConnected && roomInfo?.name) {
      dispatch(addLink({ href: `${ROUTE_TOWERS.PATH}?room=${roomId}`, label: roomInfo.name }))
    }
  }, [roomId, isConnected, roomInfo])

  useEffect(() => {
    scrollChatToBottom()
  }, [chat])

  const openInvitationModal = (id: string, data: TableInvitationData): void => {
    setInvitationModals((prev: { id: string; data: TableInvitationData }[]) => [...prev, { id, data }])
  }

  const handleCloseInvitationModal = (id: string): void => {
    setInvitationModals((prev: { id: string; data: TableInvitationData }[]) =>
      prev.filter((modal: { id: string; data: TableInvitationData }) => modal.id !== id)
    )
  }

  const handleAcceptInvitationModal = (modalId: string, tableId: string): void => {
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`)
    handleCloseInvitationModal(modalId)
  }

  const handleOpenCreateTableModal = (): void => setIsCreateTableModalOpen(true)
  const handleCloseCreateTableModal = (): void => setIsCreateTableModalOpen(false)

  const handleCreateTableSuccess = (table: ITowersTable): void => {
    handleCloseCreateTableModal()
    dispatch(joinTable({ roomId, tableId: table.id }))
      .unwrap()
      .then(() => {
        dispatch(addTable({ roomId, table }))
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${table.id}`)
      })
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
    const tablesToQuit: { id: string; isLastUser: boolean }[] | undefined = roomTables
      ?.filter((table: ITowersTable) =>
        table.userProfiles.some(
          (userProfiles: ITowersUserProfileWithRelations) =>
            userProfiles.userId === session?.user.id && userProfiles.roomId === roomId
        )
      )
      .map((table: ITowersTable) => ({
        id: table.id,
        isLastUser: table.userProfiles.length === 1
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
              <Button className="w-full py-2 mb-2" disabled={isRoomInfoLoading} onClick={handleOpenCreateTableModal}>
                Create Table
              </Button>
            </div>
            <div className="mt-4">
              {roomInfo?.difficulty !== RoomLevel.SOCIAL && (
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
                {roomTables?.map((table: ITowersTable) => (
                  <RoomTable key={table.id} roomId={roomId} table={table} isRoomTablesLoading={isRoomTablesLoading} />
                ))}
              </div>
            </div>

            {/* Chat and users list */}
            <div className="flex gap-2 h-96 p-2 border bg-white">
              <div className="flex-1 flex flex-col">
                <ServerMessage socketRoom={roomId} />

                {/* Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
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
                <PlayersList users={roomUsers} full isRatingsVisible={roomInfo?.difficulty !== RoomLevel.SOCIAL} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTable
        key={uuidv4()}
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
}

const RoomHeader = dynamic(() => import("@/components/game/RoomHeader"), {
  loading: () => <RoomHeaderSkeleton />
})

const RoomTable = dynamic(() => import("@/components/game/RoomTable"), {
  loading: () => <RoomTableSkeleton />
})

const Chat = dynamic(() => import("@/components/game/Chat"), {
  loading: () => <ChatSkeleton />
})

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton full />
})
