"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  RoomInfoWithTablesCount,
  RoomMessage,
  TableInfo,
  TowersUser,
  TowersUserRoomTableWithRelations
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
import { CHAT_MESSSAGE_MAX_LENGTH } from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addLink, removeLink } from "@/redux/features/sidebar-slice"
import { beforeLeaveSocketRoom, joinSocketRoom, sendMessageToRoomChat } from "@/redux/features/socket-slice"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchRoomChat, fetchRoomInfo, fetchRoomUsers } from "@/redux/thunks/room-thunks"
import { leaveRoom } from "@/redux/thunks/socket-thunks"

type RoomProps = {
  roomId: string
}

export default function Room({ roomId }: RoomProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { data: session } = useSessionData()
  const roomInfo: RoomInfoWithTablesCount | null = useAppSelector(
    (state: RootState) => state.socket.rooms[roomId]?.roomInfo
  )
  const isRoomInfoLoading: boolean = useAppSelector((state: RootState) => state.socket.rooms[roomId]?.isRoomInfoLoading)
  const chat: RoomMessage[] = useAppSelector((state: RootState) => state.socket.rooms[roomId]?.chat)
  const isChatLoading: boolean = useAppSelector((state: RootState) => state.socket.rooms[roomId]?.isChatLoading)
  const users: TowersUser[] = useAppSelector((state: RootState) => state.socket.rooms[roomId]?.users)
  const dispatch: AppDispatch = useAppDispatch()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState<boolean>(false)
  const [invitationModals, setInvitationModals] = useState<{ id: string; data: TableInvitationData }[]>([])

  useEffect(() => {
    dispatch(joinSocketRoom({ roomId, username: session?.user.username }))
    dispatch(fetchRoomInfo({ roomId }))
    dispatch(fetchRoomChat({ roomId }))
    dispatch(fetchRoomUsers({ roomId }))
    // openInvitationModal(uuidv4(), { user: { username: "the_player1" }, table: { tableId: 67 } })
  }, [])

  useEffect(() => {
    if (roomInfo?.room?.name) {
      dispatch(addLink({ href: `${ROUTE_TOWERS.PATH}?room=${roomId}`, label: roomInfo.room.name }))
    }
  }, [roomInfo?.room])

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
    router.push(`?room=${roomId}&table=${tableId}`)
    handleCloseInvitationModal(modalId)
  }

  const handleOpenCreateTableModal = (): void => setIsCreateTableModalOpen(true)
  const handleCloseCreateTableModal = (): void => setIsCreateTableModalOpen(false)

  // TODO: Complete
  const handleCreateTable = (tableId: string): void => {
    handleCloseCreateTableModal()
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current) {
      const message: string = messageInputRef.current.value.trim()

      if (message !== "") {
        dispatch(sendMessageToRoomChat({ roomId, message }))
        messageInputRef.current.value = ""
      }
    }
  }

  const scrollChatToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" })
  }

  const handleExitRoom = (): void => {
    const tableIds: string[] | undefined = roomInfo?.room.tables
      .filter((table: TableInfo) =>
        table.towersUserRoomTables.some(
          (towersUserRoomTable: TowersUserRoomTableWithRelations) =>
            towersUserRoomTable.towersUserProfile.user.id === session?.user.id && towersUserRoomTable.roomId === roomId
        )
      )
      .map((table: TableInfo) => table.id)

    dispatch(leaveRoom({ roomId, username: session?.user.username }))
      .unwrap()
      .then(() => {
        dispatch(beforeLeaveSocketRoom({ roomId, tableIds, username: session?.user.username }))
        dispatch(removeLink(`${ROUTE_TOWERS.PATH}?room=${roomId}`))
        router.push(ROUTE_TOWERS.PATH)
      })
      .catch((error) => {
        console.error("Error leaving room:", error)
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
              <div>
                <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">Ratings</span>
              </div>
              <div className="flex flex-col gap-4 p-2 bg-white text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-400"></div>
                  <div>2100+</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-orange-400"></div>
                  <div>1800-2099</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-purple-400"></div>
                  <div>1500-1799</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-cyan-600"></div>
                  <div>1200-1499</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-600"></div>
                  <div>0-1199</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-gray-400"></div>
                  <div>provisional</div>
                </div>
              </div>
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
                <RoomTable roomId={roomId} />
              </div>
            </div>

            {/* Chat and users list */}
            <div className="flex gap-2 h-96 p-2 border bg-white">
              <div className="flex-1 flex flex-col">
                <ServerMessage />

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
                <PlayersList users={users} full />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTable
        key={uuidv4()}
        isOpen={isCreateTableModalOpen}
        onSubmitSuccess={handleCreateTable}
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
