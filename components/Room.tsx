"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import CreateTable from "@/components/CreateTable"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import TableInvitation, { TableInvitationData } from "@/components/TableInvitation"
import AlertMessage from "@/components/ui/AlertMessage"
import Button from "@/components/ui/Button"
import { CHAT_MESSSAGE_MAX_LENGTH, ROUTE_ROOMS } from "@/constants"
import { joinRoom, leaveRoom, sendMessageToRoomChat } from "@/features"
import { useSessionData } from "@/hooks"
import { TableWithHostAndTowersGameUsers } from "@/interfaces"
import { fetchRoomChatData, fetchRoomData, fetchRoomUsersData } from "@/lib"
import { AppDispatch, RootState } from "@/redux"

type RoomProps = {
  roomId: string
}

export default function Room({ roomId }: RoomProps): ReactNode {
  const router = useRouter()
  const { data: session } = useSessionData()
  const { isConnected, socketRooms, rooms, roomsChat, roomsChatLoading, roomsUsers, error } = useSelector(
    (state: RootState) => state.socket
  )
  const dispatch: AppDispatch = useDispatch()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState<boolean>(false)
  const [invitationModals, setInvitationModals] = useState<{ id: string; data: TableInvitationData }[]>([])
  const seatMapping: number[][] = [
    [1, 3, 5, 7],
    [2, 4, 6, 8]
  ]

  useEffect(() => {
    dispatch(joinRoom({ room: roomId, isTable: false, username: session?.user.username }))
    // openInvitationModal(uuidv4(), { user: { username: "the_player1" }, table: { tableId: 67 } })
  }, [])

  useEffect(() => {
    dispatch(fetchRoomData(roomId))
    dispatch(fetchRoomChatData(roomId))
    dispatch(fetchRoomUsersData(roomId))
  }, [socketRooms[roomId]])

  useEffect(() => {
    scrollChatToBottom()
  }, [roomsChat[roomId]])

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
    // dispatch(
    //   createTable({
    //     room: roomId,
    //     // tableNumber: 67, // Is it necessary?
    //     roomId
    //   })
    // )

    // try {
    //   await dispatch(createTable({ room: roomId, tableData }));
    //   handleCloseCreateTableModal();
    // } catch (error) {
    //   dispatch(setError("Failed to create table."));
    // }

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
    chatEndRef.current?.scrollIntoView({ behavior: "instant" })
  }

  const handleExitRoom = (): void => {
    dispatch(leaveRoom({ room: roomId, isTable: false, username: session?.user.username }))
    router.push(ROUTE_ROOMS.PATH)
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gray-100 text-black">
        {/* Header */}
        <div className="py-2">
          <h2 className="p-4 text-4xl">{rooms[roomId]?.room?.name}</h2>

          {/* TODO: Testing purpose */}
          <div className="px-4 bg-amber-500">
            <p>Status: {isConnected ? "connected" : "disconnected"}</p>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="flex flex-col justify-between w-52 p-4 bg-gray-200">
            <div className="mb-4">
              <Button className="w-full py-2 mb-2" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
                Play Now
              </Button>
              <Button className="w-full py-2 mb-2" onClick={handleOpenCreateTableModal}>
                Create Table
              </Button>
            </div>
            <div className="mt-4">
              <div>
                <span className="p-1 rounded-tl rounded-tr bg-custom-blue-600 text-white text-sm">Ratings</span>
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
                {rooms[roomId]?.room?.tables.map((table: TableWithHostAndTowersGameUsers) => (
                  <div key={table.id} className="flex flex-col">
                    <div className="flex items-center border-b-2 border-b-gray-300">
                      <div className="basis-20 row-span-2 flex justify-center items-center h-full px-2 border-gray-300">
                        #{table.tableNumber}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 h-full px-2 border-l border-gray-300 divide-y divide-gray-200">
                        <div className="flex flex-1 gap-1 pt-3 pb-2">
                          <div className="basis-32 border-gray-300">
                            <Button
                              className="w-full h-full"
                              onClick={() => router.push(`?room=${roomId}&table=${table.id}`)}
                            >
                              Watch
                            </Button>
                          </div>
                          <div className="flex flex-col gap-1 border-gray-300">
                            {seatMapping.map((row, rowIndex) => (
                              <div key={rowIndex} className="flex flex-row gap-1">
                                {row.map((seatNumber, colIndex) => {
                                  const user = table.towersGameUsers.find((user) => user.seatNumber === seatNumber)
                                  return user ? (
                                    <div
                                      key={colIndex}
                                      className="flex items-center justify-center w-36 p-1 border border-gray-300 rounded"
                                    >
                                      <span className="truncate">{user.user.username}</span>
                                    </div>
                                  ) : (
                                    <Button
                                      key={colIndex}
                                      className="w-36"
                                      onClick={() => router.push(`?room=${roomId}&table=${table.id}`)}
                                    >
                                      Join
                                    </Button>
                                  )
                                })}
                              </div>
                            ))}
                          </div>
                          <div className="flex-1 px-2 line-clamp-3">
                            {/* List non-seated players by username, separated by commas */}
                            {table.towersGameUsers
                              .filter((towersGameUser) => !towersGameUser.seatNumber)
                              .map((towersGameUser) => towersGameUser.user.username)
                              .join(", ")}
                          </div>
                        </div>
                        <div className="flex py-1 text-sm">
                          {table.rated && (
                            <>
                              <span>Option: Rated</span>&nbsp;-&nbsp;
                            </>
                          )}
                          <span>Host: {table.host.user.username}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat and users list */}
            <div className="flex gap-2 h-72 p-2 bg-white border">
              <div className="flex-1 flex flex-col">
                {/* Server messages */}
                {error && <AlertMessage type="error">{error}</AlertMessage>}

                {/* Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <input
                    ref={messageInputRef}
                    type="text"
                    className="w-full p-2 border"
                    placeholder="Write something..."
                    maxLength={CHAT_MESSSAGE_MAX_LENGTH}
                    disabled={roomsChatLoading}
                    onKeyDown={handleSendMessage}
                  />
                  <div className="flex-1 overflow-y-auto p-1 my-1">
                    <Chat messages={roomsChat[roomId]} />
                    <div ref={chatEndRef} />
                  </div>
                </div>
              </div>

              <div className="w-1/4 lg:w-96 overflow-hidden">
                <PlayersList users={roomsUsers[roomId]} full />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateTable
        key={uuidv4()}
        isOpen={isCreateTableModalOpen}
        onClose={handleCloseCreateTableModal}
        onSubmitSuccess={handleCreateTable}
      />

      {invitationModals.map((modal: { id: string; data: TableInvitationData }) => (
        <TableInvitation
          key={modal.id}
          isOpen={true}
          data={modal.data}
          onClose={() => handleCloseInvitationModal(modal.id)}
          onAcceptInvitation={(tableId: string) => handleAcceptInvitationModal(modal.id, tableId)}
        />
      ))}
    </>
  )
}

const Chat = dynamic(() => import("@/components/Chat"), {
  loading: () => <ChatSkeleton />
})

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton full />
})
