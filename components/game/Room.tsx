"use client"

import { KeyboardEvent, MouseEvent, ReactNode, RefObject, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { Trans } from "@lingui/react/macro"
import { ITowersRoom, ITowersRoomChatMessage, ITowersTable, ITowersUserProfile, RoomLevel } from "@prisma/client"
import CreateTable from "@/components/game/CreateTable"
import ServerMessage from "@/components/game/ServerMessage"
import TableInvitation, { TableInvitationData } from "@/components/game/TableInvitation"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import RoomHeaderSkeleton from "@/components/skeleton/RoomHeaderSkeleton"
import RoomTableSkeleton from "@/components/skeleton/RoomTableSkeleton"
import Button from "@/components/ui/Button"
import { RATING_DIAMOND, RATING_GOLD, RATING_MASTER, RATING_PLATINUM, RATING_SILVER } from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { TowersRoomTableState } from "@/interfaces/socket"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addLink, removeLink } from "@/redux/features/sidebar-slice"
import { addChatMessageToRoom, addTableToRoom, joinRoom, leaveRoom } from "@/redux/features/socket-slice"
import {
  selectIsRoomChatLoading,
  selectIsRoomInfoLoading,
  selectIsRoomTablesLoading,
  selectRoomChat,
  selectRoomInfo,
  selectRoomIsJoined,
  selectRoomTables,
  selectRoomUsers,
} from "@/redux/selectors/socket-selectors"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchRoomChat, fetchRoomInfo, fetchRoomTables, fetchRoomUsers } from "@/redux/thunks/room-thunks"

export default function Room(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch: AppDispatch = useAppDispatch()

  const roomId: string | null = searchParams.get("room")

  if (!roomId) {
    throw new Error("Room ID is required")
  }

  const isConnected: boolean = useAppSelector((state: RootState) => state.socket?.isConnected)
  const isJoinedRoom: boolean = useAppSelector((state: RootState) => selectRoomIsJoined(state, roomId))
  const roomInfo: ITowersRoom | null = useAppSelector((state: RootState) => selectRoomInfo(state, roomId))
  const isInfoLoading: boolean = useAppSelector((state: RootState) => selectIsRoomInfoLoading(state, roomId))
  const chat: ITowersRoomChatMessage[] = useAppSelector((state: RootState) => selectRoomChat(state, roomId))
  const isChatLoading: boolean = useAppSelector((state: RootState) => selectIsRoomChatLoading(state, roomId))
  const roomUsers: ITowersUserProfile[] = useAppSelector((state: RootState) => selectRoomUsers(state, roomId))
  const tables: TowersRoomTableState[] = useAppSelector((state: RootState) => selectRoomTables(state, roomId))
  const isTablesLoading: boolean = useAppSelector((state: RootState) => selectIsRoomTablesLoading(state, roomId))
  const messageInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState<boolean>(false)
  const [invitationModals, setInvitationModals] = useState<{ id: string; data: TableInvitationData }[]>([])

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

  const handleCreateTableSuccess = (table: ITowersTable): void => {
    dispatch(addTableToRoom({ roomId, table }))
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${table.id}`)
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current) {
      const message: string = messageInputRef.current.value.trim()

      if (message !== "") {
        dispatch(addChatMessageToRoom({ roomId, message }))
        messageInputRef.current.value = ""
      }
    }
  }

  const handleExitRoom = (): void => {
    dispatch(leaveRoom({ roomId }))
    dispatch(removeLink(`${ROUTE_TOWERS.PATH}?room=${roomId}`))
    router.push(ROUTE_TOWERS.PATH)
  }

  useEffect(() => {
    if (isConnected) {
      if (isJoinedRoom) {
        dispatch(fetchRoomInfo({ roomId }))
        dispatch(fetchRoomChat({ roomId }))
        dispatch(fetchRoomUsers({ roomId }))
        dispatch(fetchRoomTables({ roomId }))
      } else {
        dispatch(joinRoom({ roomId }))
      }
    }
  }, [isConnected, isJoinedRoom, dispatch])

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

  return (
    <>
      <div className="grid [grid-template-areas:'banner_banner_banner''sidebar_content_content''sidebar_content_content'] grid-rows-game grid-cols-game h-screen -m-4 -mb-8 bg-gray-100 text-black">
        <RoomHeader room={roomInfo} />

        {/* Left sidebar */}
        <div className="[grid-area:sidebar] flex flex-col justify-between p-2 bg-gray-200">
          <div className="mb-4">
            <Button className="w-full py-2 mb-2" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              <Trans>Play Now</Trans>
            </Button>
            <Button className="w-full py-2 mb-2" disabled={isInfoLoading} onClick={handleOpenCreateTableModal}>
              <Trans>Create Table</Trans>
            </Button>
          </div>
          <div className="mt-4">
            {roomInfo && roomInfo?.difficulty !== RoomLevel.SOCIAL && (
              <>
                <div>
                  <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">
                    <Trans>Ratings</Trans>
                  </span>
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
                    <div>
                      <Trans>provisional</Trans>
                    </div>
                  </div>
                </div>
              </>
            )}
            <Button className="w-full py-2 mb-2" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              <Trans>Options</Trans>
            </Button>
            <Button className="w-full py-2 mb-2" onClick={handleExitRoom}>
              <Trans>Exit Room</Trans>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="[grid-area:content] grid [grid-template-areas:'tables''chat'] grid-rows-game-content gap-2 px-2 pb-2">
          {/* Tables */}
          <div className="[grid-area:tables] overflow-hidden flex flex-col border bg-white">
            <div className="flex gap-1 py-2 bg-yellow-200">
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
              {tables?.map(
                (table: TowersRoomTableState) =>
                  table?.info?.id && (
                    <RoomTable key={table?.info?.id} table={table} isTablesLoading={isTablesLoading} />
                  ),
              )}
            </div>
          </div>

          {/* Chat and users list */}
          <div className="[grid-area:chat] flex gap-2">
            <div className="overflow-hidden flex-1 flex flex-col gap-1 border bg-white">
              <ServerMessage roomId={roomId} />

              {/* Chat */}
              <div className="overflow-hidden flex flex-col gap-1 h-full px-2">
                <Chat
                  messages={chat}
                  messageInputRef={messageInputRef}
                  isMessageInputDisabled={isChatLoading}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>

            <div className="w-[385px]">
              <PlayersList
                users={roomUsers}
                isRatingsVisible={roomInfo && roomInfo?.difficulty !== RoomLevel.SOCIAL}
                isTableNumberVisible
              />
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
}

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
