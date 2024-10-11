"use client"

import { ChangeEvent, KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import {
  ITowersTable,
  ITowersTableChatMessage,
  ITowersUserProfile,
  ITowersUserProfileWithRelations,
  IUserWithRelations,
  TableChatMessageType,
  TableType
} from "@prisma/client"
import clsx from "clsx/lite"
import { v4 as uuidv4 } from "uuid"
import ServerMessage from "@/components/game/ServerMessage"
import TableBootUser from "@/components/game/TableBootUser"
import TableInviteUser from "@/components/game/TableInviteUser"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import TableHeaderSkeleton from "@/components/skeleton/TableHeaderSkeleton"
import PlayerBoard from "@/components/towers/PlayerBoard"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import Select from "@/components/ui/Select"
import { CHAT_MESSSAGE_MAX_LENGTH } from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addLink, removeLink } from "@/redux/features/sidebar-slice"
import {
  addTable,
  beforeLeaveTableAction,
  joinTableAction,
  removeTable,
  sendTableChatMessage,
  sendTablePrivateChatMessage,
  updateTable
} from "@/redux/features/socket-slice"
import {
  selectIsTableChatLoading,
  selectIsTableInfoLoading,
  selectNextTableHost,
  selectRoomUsersInvite,
  selectTableByIdInRoom,
  selectTableChat,
  selectTableInfo,
  selectTableUsers,
  selectTableUsersBoot
} from "@/redux/selectors/socket-selectors"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchRoomUsers } from "@/redux/thunks/room-thunks"
import { leaveRoom } from "@/redux/thunks/socket-thunks"
import { fetchTableChat, fetchTableInfo, fetchTableUsers } from "@/redux/thunks/table-thunks"

enum GameState {
  WAITING_FOR_PLAYERS = 0,
  READY = 1,
  COUNTDOWN = 2,
  STARTED = 3,
  GAME_OVER = 4,
  ERROR = 5,
}

interface SeatsCss {
  rowSpan: number
  seatNumbers: number[]
  team: number
}

const INITIAL_SEATS_CSS = [
  { rowSpan: 5, seatNumbers: [1, 2], team: 1 },
  { rowSpan: 3, seatNumbers: [5, 6], team: 3 },
  { rowSpan: 3, seatNumbers: [3, 4], team: 2 },
  { rowSpan: 3, seatNumbers: [7, 8], team: 4 }
]

type TableProps = {
  roomId: string
  tableId: string
}

export default function Table({ roomId, tableId }: TableProps): ReactNode {
  const router: AppRouterInstance = useRouter()
  const { data: session } = useSessionData()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  // const roomTable: ITowersTable | null = useAppSelector((state: RootState) =>
  //   selectTableByIdInRoom(state, roomId, tableId)
  // )
  const tableInfo: ITowersTable | null = useAppSelector((state: RootState) => selectTableInfo(state, tableId))
  const isTableInfoLoading: boolean = useAppSelector((state: RootState) => selectIsTableInfoLoading(state, tableId))
  const chat: ITowersTableChatMessage[] = useAppSelector((state: RootState) => selectTableChat(state, tableId))
  const isChatLoading: boolean = useAppSelector((state: RootState) => selectIsTableChatLoading(state, tableId))
  const tableUsers: ITowersUserProfile[] = useAppSelector((state: RootState) => selectTableUsers(state, tableId))
  const roomUsersInvite: ITowersUserProfile[] = useAppSelector((state: RootState) =>
    selectRoomUsersInvite(state, roomId, tableId)
  )
  const tableUsersBoot: ITowersUserProfile[] = useAppSelector((state: RootState) =>
    selectTableUsersBoot(state, tableId, session)
  )
  const nextTableHost: IUserWithRelations | null = useAppSelector((state: RootState) =>
    selectNextTableHost(state, tableId)
  )
  const dispatch: AppDispatch = useAppDispatch()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [tableType, setTableType] = useState<string>(TableType.PUBLIC)
  const [isRated, setIsRated] = useState<boolean>(true)
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false)
  const [isBootUserModalOpen, setIsBootUserModalOpen] = useState<boolean>(false)
  const [seatsCss, setSeatsCss] = useState<SeatsCss[]>(INITIAL_SEATS_CSS)
  const [seatedSeats, setSeatedSeats] = useState<Set<number>>(new Set())
  const [isGameState, setGameState] = useState<GameState>(GameState.WAITING_FOR_PLAYERS)
  const [seatUnavailable, setSeatUnavailable] = useState<boolean>(false)
  const [previousTableUsersCount, setPreviousTableUsersCount] = useState<number>(0)

  useEffect(() => {
    if (isConnected) {
      dispatch(joinTableAction({ tableId }))
    }
  }, [tableId, isConnected])

  useEffect(() => {
    if (isConnected) {
      const abortController: AbortController = new AbortController()
      const { signal } = abortController

      dispatch(fetchRoomUsers({ roomId, signal }))

      return () => {
        abortController.abort()
      }
    }
  }, [roomId, isConnected])

  useEffect(() => {
    if (isConnected) {
      const abortController: AbortController = new AbortController()
      const { signal } = abortController

      dispatch(fetchTableInfo({ tableId, signal }))

      if (session?.user.id) {
        dispatch(fetchTableChat({ tableId, userId: session?.user.id, signal }))
      }

      dispatch(fetchTableUsers({ tableId, signal }))

      return () => {
        abortController.abort()
      }
    }
  }, [tableId, isConnected])

  useEffect(() => {
    if (tableInfo?.room?.name) {
      dispatch(
        addLink({
          href: `${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`,
          label: `${tableInfo.room.name} - Table ${tableInfo.tableNumber}`
        })
      )
    }
  }, [tableInfo?.room])

  useEffect(() => {
    if (tableInfo) {
      setIsRated(tableInfo.rated)
      setTableType(tableInfo.tableType)
    }
  }, [tableInfo])

  useEffect(() => {
    if (isConnected) {
      if (nextTableHost && tableUsers.length > 0 && tableUsers.length < previousTableUsersCount) {
        const userProfiles: ITowersUserProfileWithRelations[] = tableUsers.map(({ room, table, ...rest }) => rest)

        // Update table's host and users list
        dispatch(
          updateTable({
            roomId,
            tableId,
            table: {
              ...tableInfo,
              host: nextTableHost,
              userProfiles
            } as ITowersTable
          })
        )
      }

      setPreviousTableUsersCount(tableUsers.length)
    }
  }, [isConnected, tableUsers])

  useEffect(() => {
    if (nextTableHost?.id === session?.user.id && nextTableHost && tableInfo?.host !== nextTableHost) {
      // Send table host message to new host
      dispatch(
        sendTablePrivateChatMessage({
          tableId,
          username: session?.user.username!,
          chatMessageType: TableChatMessageType.TABLE_HOST_UPDATE
        })
      )
    }
  }, [tableUsers])

  useEffect(() => {
    scrollChatToBottom()
  }, [chat])

  const handleOpenBootUserModal = (): void => setIsBootUserModalOpen(true)
  const handleCloseBootUserModal = (): void => setIsBootUserModalOpen(false)

  const handleOpenInviteUserModal = (): void => setIsInviteUserModalOpen(true)
  const handleCloseInviteUserModal = (): void => setIsInviteUserModalOpen(false)

  const handleSeatClick = (seat: number | null): void => {
    setSeatedSeats((prevSeatedSeats: Set<number>) => {
      const newSeats: Set<number> = new Set<number>(prevSeatedSeats)

      if (seat === null) {
        newSeats.clear()
        setSeatsCss(INITIAL_SEATS_CSS)
      } else {
        if (newSeats.has(seat)) {
          newSeats.delete(seat)
        } else {
          newSeats.add(seat)
        }
      }

      return newSeats
    })

    setSeatsCss((prevSeatsCss: SeatsCss[]) => {
      if (!seat || seat === 1 || seat === 2) return prevSeatsCss

      const clickedTeamGroup: SeatsCss | undefined = prevSeatsCss.find((group: SeatsCss) =>
        group.seatNumbers.includes(seat)
      )
      if (!clickedTeamGroup) return prevSeatsCss

      const clickedTeamSeats: number[] = clickedTeamGroup.seatNumbers
      const clickedTeam: number = clickedTeamGroup.team

      const otherTeamsGroups: SeatsCss[] = prevSeatsCss.filter((group: SeatsCss) => group.team !== clickedTeam)
      if (otherTeamsGroups.length === 0) return prevSeatsCss

      const teamToSwapWithGroup: SeatsCss = otherTeamsGroups[0]
      const teamToSwapWithSeats: number[] = teamToSwapWithGroup.seatNumbers

      const newSeatsMapping: Record<number, number> = {}

      clickedTeamSeats.forEach((seat: number, index: number) => {
        newSeatsMapping[seat] = teamToSwapWithSeats[index % teamToSwapWithSeats.length]
      })

      teamToSwapWithSeats.forEach((seat: number, index: number) => {
        newSeatsMapping[seat] = clickedTeamSeats[index % clickedTeamSeats.length]
      })

      return prevSeatsCss.map((group: SeatsCss) => ({
        ...group,
        seatNumbers: group.seatNumbers.map((seat: number) => newSeatsMapping[seat] || seat)
      }))
    })
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current) {
      const message: string = messageInputRef.current.value.trim()

      if (message !== "") {
        dispatch(sendTableChatMessage({ tableId, message }))
        messageInputRef.current.value = ""
      }
    }
  }

  const scrollChatToBottom = (): void => {
    chatEndRef.current?.scrollIntoView({ behavior: "instant", block: "end" })
  }

  const handleQuitTable = (): void => {
    dispatch(leaveRoom({ roomId, tableId }))
      .unwrap()
      .then(() => {
        const usersCount: number = tableInfo?.userProfiles.length ?? 0

        dispatch(beforeLeaveTableAction({ tableId, isLastUser: usersCount === 1 ? true : false }))

        if (usersCount === 1) {
          dispatch(removeTable({ roomId, tableId }))
        }

        dispatch(removeLink(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`))
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
      })
      .catch((error) => {
        console.error("Error leaving table:", error)
      })
  }

  return (
    <>
      <div className="grid [grid-template-areas:'banner_banner_banner''sidebar_game_game''sidebar_chat_chat'] grid-rows-table grid-cols-table h-screen -m-4 bg-gray-100 text-black">
        <TableHeader table={tableInfo} />

        {/* Left sidebar */}
        <div className="[grid-area:sidebar] flex flex-col justify-between w-56 p-2 bg-gray-200">
          <div className="space-y-2">
            <Button
              className="w-full"
              disabled={isTableInfoLoading}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {}}
            >
              Start
            </Button>
            <hr className="border-1 border-gray-400" />
            <Button className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Change Keys
            </Button>
            <Button className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Demo
            </Button>
            <hr className="border-1 border-gray-400" />
            <Button
              className="w-full"
              disabled={isTableInfoLoading}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {}}
            >
              Stand
            </Button>
            <div>
              <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">Table Type</span>
            </div>
            <Select
              id="tableType"
              defaultValue={tableType}
              disabled={isTableInfoLoading || session?.user.id !== tableInfo?.host.id}
              onChange={setTableType}
            >
              <Select.Option value={TableType.PUBLIC}>Public</Select.Option>
              <Select.Option value={TableType.PROTECTED}>Protected</Select.Option>
              <Select.Option value={TableType.PRIVATE}>Private</Select.Option>
            </Select>
            <Button
              className="w-full"
              disabled={isTableInfoLoading || session?.user.id !== tableInfo?.host.id}
              onClick={handleOpenInviteUserModal}
            >
              Invite
            </Button>
            <Button
              className="w-full"
              disabled={isTableInfoLoading || session?.user.id !== tableInfo?.host.id}
              onClick={handleOpenBootUserModal}
            >
              Boot
            </Button>
            <div>
              <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">Options</span>
            </div>
            <Checkbox
              id="ratedGame"
              label="Rated Game"
              defaultChecked={isRated}
              disabled={isTableInfoLoading || session?.user.id !== tableInfo?.host.id}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setIsRated(event.target.checked)}
            />
            <Checkbox
              id="sound"
              label="Sound"
              disabled
              onChange={(event: ChangeEvent<HTMLInputElement>) => console.log(event.target.checked)}
            />
          </div>
          <div className="flex gap-1">
            <Button className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Help
            </Button>
            <Button className="w-full" onClick={handleQuitTable}>
              Quit
            </Button>
          </div>
        </div>

        {/* Center part */}
        <div className="[grid-area:game] flex items-center gap-2 w-full px-2 pb-2">
          <div className="flex items-center w-full h-full border bg-neutral-50">
            <div className="relative grid grid-rows-table-team grid-cols-table-team gap-2 w-fit p-2 mx-auto bg-neutral-50">
              {/* Game countdown */}
              {isGameState === GameState.COUNTDOWN && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[8px] z-30 flex flex-col items-center w-[450px] h-48 p-1 border-2 border-gray-400 bg-gray-200 shadow-lg">
                  <div className="text-2xl">The next game is starting in</div>
                  <div className="flex-1 flex items-center text-7xl text-orange-400 font-semibold normal-nums">14</div>
                  <div className="text-2xl">seconds</div>
                </div>
              )}

              {/* Game over */}
              {isGameState === GameState.GAME_OVER && (
                <div className="absolute left-0 top-0 gap-8 z-30 flex flex-col justify-start items-center w-full h-max p-1 mt-16 font-medium [text-shadow:_4px_4px_0_rgb(0_0_0)] animate-move-up">
                  <div className="text-8xl text-fuchsia-600">Game Over</div>
                  <div className="text-6xl text-yellow-400">You win!</div>
                  {/* <div className="flex flex-col gap-8 items-center text-6xl">
                    <div className="text-yellow-400">You lose!</div>
                    <div className="text-fuchsia-600">Congratulations</div>
                    <div className="text-fuchsia-600">the_player1</div>
                  </div> */}
                </div>
              )}

              {/* Controls and game timer */}
              <div className="row-span-3 flex flex-col justify-between items-start px-2 py-1 text-lg">
                <div>
                  <div className="flex flex-row gap-2">
                    <div>Left:</div> <div className="text-gray-500">Left Arrow</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div>Right:</div> <div className="text-gray-500">Right Arrow</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div>Drop:</div> <div className="text-gray-500">Down Arrow</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div>Cycle Color:</div> <div className="text-gray-500">Up Arrow</div>
                  </div>
                  <div className="flex flex-row gap-2">
                    <div>Use Item:</div> <div className="text-gray-500">Space Bar</div>
                  </div>
                </div>
                <div className="w-full border-double border-8 border-neutral-300 font-mono text-gray-400 text-6xl text-center tabular-nums">
                  --:--
                </div>
              </div>

              {/* Game */}
              {seatsCss.map((group: SeatsCss, index: number) => (
                <div
                  key={index}
                  className={clsx(
                    `row-span-${group.rowSpan}`,
                    index === 0 ? "flex flex-row justify-center items-center" : ""
                  )}
                >
                  <div className={index === 0 ? "contents" : "flex flex-row justify-center items-center"}>
                    {group.seatNumbers.map((seat: number) => (
                      <PlayerBoard
                        key={seat}
                        seatNumber={seat}
                        isOpponentBoard={group.team > 1}
                        isReversed={seat % 2 === 0}
                        isSeated={seatedSeats.has(seat)}
                        isSeatOccupied={seatUnavailable}
                        onChooseSeat={handleSeatClick}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* <div className="row-span-5 flex flex-row justify-center items-center">
                <PlayerBoard boardNumber={1} />
                <PlayerBoard boardNumber={2} isReversed />
              </div>
              <div className="row-span-3">
                <div className="flex flex-row justify-center items-center">
                  <PlayerBoard boardNumber={5} isOpponentBoard />
                  <PlayerBoard boardNumber={6} isOpponentBoard isReversed />
                </div>
              </div>
              <div className="row-span-3">
                <div className="flex flex-row justify-center items-center">
                  <PlayerBoard boardNumber={3} isOpponentBoard />
                  <PlayerBoard boardNumber={4} isOpponentBoard isReversed />
                </div>
              </div>
              <div className="row-span-3">
                <div className="flex flex-row justify-center items-center">
                  <PlayerBoard boardNumber={7} isOpponentBoard />
                  <PlayerBoard boardNumber={8} isOpponentBoard isReversed />
                </div>
              </div> */}

              <div className="row-span-1 flex flex-col justify-start w-[515px] px-2 bg-neutral-200 font-mono">
                {/* Next power to be used by current player */}
                <span className="w-full truncate">You can send a midas piece</span>
                {/* Power used by other players */}
                <span className="w-full text-gray-500 truncate">
                  the_player1 mega defused the_player1abcdefghijklmnopqrstuvwxyz
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat and users list */}
        <div className="[grid-area:chat] flex gap-2 px-2 pb-2">
          <div className="flex-1 flex flex-col">
            <ServerMessage />

            {/* Chat */}
            <div className="flex-1 flex flex-col p-2 border bg-white">
              <input
                ref={messageInputRef}
                type="text"
                className="w-full p-2 border"
                placeholder="Write something..."
                maxLength={CHAT_MESSSAGE_MAX_LENGTH}
                disabled={isChatLoading}
                onKeyDown={handleSendMessage}
              />
              <div className="overflow-y-auto p-1">
                <Chat messages={chat} isTableChat />
                <div ref={chatEndRef} />
              </div>
            </div>
          </div>

          <PlayersList users={tableUsers} />
        </div>
      </div>

      <TableInviteUser
        key={uuidv4()}
        isOpen={isInviteUserModalOpen}
        users={roomUsersInvite}
        onCancel={handleCloseInviteUserModal}
      />

      <TableBootUser
        key={uuidv4()}
        isOpen={isBootUserModalOpen}
        users={tableUsersBoot}
        onCancel={handleCloseBootUserModal}
      />
    </>
  )
}

const TableHeader = dynamic(() => import("@/components/game/TableHeader"), {
  loading: () => <TableHeaderSkeleton />
})

const Chat = dynamic(() => import("@/components/game/Chat"), {
  loading: () => <ChatSkeleton />
})

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton />
})
