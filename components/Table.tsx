"use client"

import { KeyboardEvent, MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { TableType } from "@prisma/client"
import clsx from "clsx/lite"
import { useDispatch, useSelector } from "react-redux"
import { v4 as uuidv4 } from "uuid"
import PlayerBoard from "@/components/game/PlayerBoard"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import TableBootUser from "@/components/TableBootUser"
import TableInviteUser from "@/components/TableInviteUser"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import Select from "@/components/ui/Select"
import { CHAT_MESSSAGE_MAX_LENGTH } from "@/constants"
import { joinRoom, leaveRoom, sendMessageToTableChat } from "@/features"
import { useSessionData } from "@/hooks"
import { TowersGameUserWithUserAndTables } from "@/interfaces"
import { fetchRoomUsersData, fetchTableChatData, fetchTableData, fetchTableUsersData } from "@/lib"
import { AppDispatch, RootState } from "@/redux"

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
  const router = useRouter()
  const { data: session } = useSessionData()
  const { socketRooms, roomsUsers, tables, tablesChat, tablesChatLoading, tablesUsers } = useSelector(
    (state: RootState) => state.socket
  )
  const dispatch: AppDispatch = useDispatch()
  const messageInputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false)
  const [isBootUserModalOpen, setIsBootUserModalOpen] = useState<boolean>(false)
  const [seatsCss, setSeatsCss] = useState<SeatsCss[]>(INITIAL_SEATS_CSS)
  const [seatedSeats, setSeatedSeats] = useState<Set<number>>(new Set())
  const [isGameState, setGameState] = useState<GameState>(GameState.WAITING_FOR_PLAYERS)
  const [seatUnavailable, setSeatUnavailable] = useState<boolean>(false)

  useEffect(() => {
    dispatch(joinRoom({ room: tableId, isTable: true, username: session?.user.username }))
  }, [])

  useEffect(() => {
    dispatch(fetchRoomUsersData(roomId))
  }, [socketRooms[roomId]])

  useEffect(() => {
    dispatch(fetchTableData(tableId))
    dispatch(fetchTableChatData({ tableId, towersUserId: session?.user.towersUserId }))
    dispatch(fetchTableUsersData(tableId))
  }, [socketRooms[tableId]])

  useEffect(() => {
    scrollChatToBottom()
  }, [tablesChat[tableId]])

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
        dispatch(
          sendMessageToTableChat({
            tableId,
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

  const handleQuitTable = (): void => {
    dispatch(leaveRoom({ room: tableId, isTable: true, username: session?.user.username }))
    router.push(`?room=${roomId}`)
  }

  return (
    <>
      <div className="grid grid-areas-table grid-rows-table grid-cols-table h-full bg-custom-blue-1000">
        {/* Title */}
        <div className="grid-in-banner h-24 p-4 text-custom-blue-200">
          <h3 className="text-4xl">
            Table: {tables[tableId]?.tableNumber} - Host: {tables[tableId]?.host.user.username}
          </h3>
          <h2>{tables[tableId]?.room.name}</h2>
        </div>

        {/* Left sidebar */}
        <div className="grid-in-sidebar flex flex-col justify-between w-56 p-2 bg-custom-blue-800">
          <div className="space-y-2">
            <Button isTableButton className="w-full" onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Start
            </Button>
            <hr className="border-1 border-custom-neutral-100" />
            <Button isTableButton className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Change Keys
            </Button>
            <Button isTableButton className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Demo
            </Button>
            <hr className="border-1 border-custom-neutral-100" />
            <Button isTableButton className="w-full" onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Stand
            </Button>
            <div>
              <span className="p-1 rounded-tl rounded-tr bg-custom-blue-600 text-white text-sm">Table Type</span>
            </div>
            <Select
              id="tableType"
              isTableButton
              defaultValue={tables[tableId]?.tableType}
              onChange={(value: string) => console.log(value)}
            >
              <Select.Option value={TableType.PUBLIC}>Public</Select.Option>
              <Select.Option value={TableType.PROTECTED}>Protected</Select.Option>
              <Select.Option value={TableType.PRIVATE}>Private</Select.Option>
            </Select>
            <Button isTableButton className="w-full" onClick={handleOpenInviteUserModal}>
              Invite
            </Button>
            <Button isTableButton className="w-full" onClick={handleOpenBootUserModal}>
              Boot
            </Button>
            <div>
              <span className="p-1 rounded-tl rounded-tr bg-custom-blue-600 text-white text-sm">Options</span>
            </div>
            <Checkbox
              id="ratedGame"
              label="Rated Game"
              isTableCheckbox
              defaultChecked={tables[tableId]?.rated}
              onChange={(value: boolean) => console.log(value)}
            />
            <Checkbox
              id="sound"
              label="Sound"
              isTableCheckbox
              disabled
              onChange={(value: boolean) => console.log(value)}
            />
          </div>
          <div className="flex gap-1">
            <Button isTableButton className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
              Help
            </Button>
            <Button isTableButton className="w-full" onClick={handleQuitTable}>
              Quit
            </Button>
          </div>
        </div>

        {/* Center part */}
        <div className="grid-in-game flex items-center w-full">
          <div className="relative grid grid-rows-table-team grid-cols-table-team gap-2 w-fit p-2 mx-auto bg-custom-blue-1000 text-custom-blue-100">
            {/* Game countdown */}
            {isGameState === GameState.COUNTDOWN && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[8px] z-30 flex flex-col items-center w-[450px] h-48 p-1 border-2 border-custom-blue-200 bg-custom-blue-900 text-custom-neutral-100">
                <div className="text-2xl">The next game is starting in</div>
                <div className="flex-1 flex items-center text-7xl text-custom-orange-100 font-semibold normal-nums">
                  14
                </div>
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
                  <div>Left:</div> <div className="text-custom-neutral-100">Left Arrow</div>
                </div>
                <div className="flex flex-row gap-2">
                  <div>Right:</div> <div className="text-custom-neutral-100">Right Arrow</div>
                </div>
                <div className="flex flex-row gap-2">
                  <div>Drop:</div> <div className="text-custom-neutral-100">Down Arrow</div>
                </div>
                <div className="flex flex-row gap-2">
                  <div>Cycle Color:</div> <div className="text-custom-neutral-100">Up Arrow</div>
                </div>
                <div className="flex flex-row gap-2">
                  <div>Use Item:</div> <div className="text-custom-neutral-100">Space Bar</div>
                </div>
              </div>
              <div className="w-full border-double border-8 border-custom-blue-900 font-mono text-custom-blue-800 text-6xl text-center tabular-nums">
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

            {/* TODO: Remove */}
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

            <div className="row-span-1 flex flex-col justify-start items-center px-2 bg-custom-blue-800 font-mono">
              {/* Next power to be used by current player */}
              <p className="w-full text-custom-neutral-100 text-start line-clamp-1">You can send a midas piece</p>
              {/* Power used by other players */}
              <p className="w-full text-custom-green-100 text-start line-clamp-1">
                the_player1 mega defused 000_crazy_player_8_000
              </p>
            </div>
          </div>
        </div>

        {/* Chat and players list */}
        <div className="grid-in-chat flex divide-x divide-custom-neutral-100 text-custom-blue-100">
          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <input
              ref={messageInputRef}
              type="text"
              className="p-2 border border-custom-neutral-100 bg-transparent"
              placeholder="Write something..."
              maxLength={CHAT_MESSSAGE_MAX_LENGTH}
              disabled={tablesChatLoading}
              onKeyDown={handleSendMessage}
            />
            <div className="overflow-y-auto p-1">
              <Chat messages={tablesChat[tableId]} isTableChat />
              <div ref={chatEndRef} />
            </div>
          </div>

          <PlayersList users={tablesUsers[tableId]} />
        </div>
      </div>

      <TableInviteUser
        key={uuidv4()}
        isOpen={isInviteUserModalOpen}
        users={roomsUsers[roomId]?.filter(
          (roomsUser: TowersGameUserWithUserAndTables) => roomsUser.tableId !== tableId
        )}
        onClose={handleCloseInviteUserModal}
      />

      <TableBootUser
        key={uuidv4()}
        isOpen={isBootUserModalOpen}
        users={tablesUsers[tableId]}
        onClose={handleCloseBootUserModal}
      />
    </>
  )
}

const Chat = dynamic(() => import("@/components/Chat"), {
  loading: () => <ChatSkeleton />
})

const PlayersList = dynamic(() => import("@/components/PlayersList"), {
  loading: () => <PlayersListSkeleton />
})
