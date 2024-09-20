"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import CreateTable from "@/components/CreateTable"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import RoomHeaderSkeleton from "@/components/skeleton/RoomHeaderSkeleton"
import RoomTableSkeleton from "@/components/skeleton/RoomTableSkeleton"
import TableInvitation, { TableInvitationData } from "@/components/TableInvitation"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { CHAT_MESSSAGE_MAX_LENGTH, ROUTE_ROOMS } from "@/constants"
import { useSessionData } from "@/hooks"
import { RoomChatWithTowersGameUser, RoomWithTablesCount, TowersGameUserWithUserAndTables } from "@/interfaces"
import { sendMessageToRoomChat } from "@/redux/features"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchRoomChat, fetchRoomInfo, fetchRoomUsers, joinRoom, leaveRoom } from "@/redux/thunks"
import { debounce } from "@/utils"

type RoomProps = {
  roomId: string
}

export default function Room({ roomId }: RoomProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { data: session } = useSessionData()
  const roomInfo: RoomWithTablesCount | null = useSelector((state: RootState) => state.socket.rooms[roomId]?.roomInfo)
  const isRoomInfoLoading: boolean = useSelector((state: RootState) => state.socket.rooms[roomId]?.isRoomInfoLoading)
  const chat: RoomChatWithTowersGameUser[] = useSelector((state: RootState) => state.socket.rooms[roomId]?.chat)
  const isChatLoading: boolean = useSelector((state: RootState) => state.socket.rooms[roomId]?.isChatLoading)
  const users: TowersGameUserWithUserAndTables[] = useSelector((state: RootState) => state.socket.rooms[roomId]?.users)
  const errorMessage = useSelector((state: RootState) => state.socket.errorMessage)
  const dispatch: AppDispatch = useDispatch()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState<boolean>(false)
  const [invitationModals, setInvitationModals] = useState<{ id: string; data: TableInvitationData }[]>([])

  useEffect(() => {
    dispatch(joinRoom({ room: roomId, isTable: false, username: session?.user.username }))
    // openInvitationModal(uuidv4(), { user: { username: "the_player1" }, table: { tableId: 67 } })
  }, [])

  useEffect(() => {
    const debouncedFetchData: Debounce = debounce(() => {
      dispatch(fetchRoomInfo(roomId))
      dispatch(fetchRoomChat(roomId))
      dispatch(fetchRoomUsers(roomId))
    }, 500)

    debouncedFetchData()
  }, [])

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

  const handleCreateTable = (tableId: string): void => {
    // TODO: Complete
    handleCloseCreateTableModal()
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current) {
      const message: string = messageInputRef.current.value.trim()

      if (message !== "") {
        dispatch(
          sendMessageToRoomChat({
            roomId,
            towersUserId: session?.user.towersUserId,
            message
          })
        )

        messageInputRef.current.value = ""
      }
    }
  }

  const scrollChatToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" })
  }

  const handleExitRoom = (): void => {
    dispatch(leaveRoom({ room: roomId, isTable: false, username: session?.user.username }))
    router.push(ROUTE_ROOMS.PATH)
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gray-100 text-black">
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
            <div className="flex gap-2 h-72 p-2 border bg-white">
              <div className="flex-1 flex flex-col">
                {/* Server messages */}
                {errorMessage && <AlertMessage type="error">{errorMessage}</AlertMessage>}

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

const RoomHeader = dynamic(() => import("@/components/RoomHeader"), {
  loading: () => <RoomHeaderSkeleton />
})

const RoomTable = dynamic(() => import("@/components/RoomTable"), {
  loading: () => <RoomTableSkeleton />
})

const Chat = dynamic(() => import("@/components/Chat"), {
  loading: () => <ChatSkeleton />
})

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton full />
})
