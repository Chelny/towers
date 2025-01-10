"use client"

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { Trans, useLingui } from "@lingui/react/macro"
import { createId } from "@paralleldrive/cuid2"
import { ITowersTable, ITowersTableChatMessage, RoomLevel, TableChatMessageType, TableType } from "@prisma/client"
import { ITowersUserProfile } from "@prisma/client"
import { Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import clsx from "clsx/lite"
import ServerMessage from "@/components/game/ServerMessage"
import TableBootUser from "@/components/game/TableBootUser"
import TableInviteUser from "@/components/game/TableInviteUser"
import Timer from "@/components/game/Timer"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import TableHeaderSkeleton from "@/components/skeleton/TableHeaderSkeleton"
import PlayerBoard from "@/components/towers/PlayerBoard"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import Select from "@/components/ui/Select"
import { ROUTE_TOWERS } from "@/constants/routes"
import { GameState } from "@/enums/towers"
import { useSeatAssignment } from "@/hooks/useTableSeatAssignment"
import { TowersSeat, TowersTeam } from "@/interfaces/table"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { addLinks, removeLink } from "@/redux/features/sidebar-slice"
import {
  addChatMessageToTable,
  joinTable,
  leaveTable,
  tableErrorMessage,
  updateRoomTable,
} from "@/redux/features/socket-slice"
import {
  selectIsTableChatLoading,
  selectIsTableInfoLoading,
  selectTableChat,
  selectTableInfo,
  selectTableIsJoined,
  selectTableUsers,
} from "@/redux/selectors/socket-selectors"
import { AppDispatch, RootState } from "@/redux/store"
import { fetchTableChat, fetchTableInfo, fetchTableUsers } from "@/redux/thunks/table-thunks"

export default function Table(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch: AppDispatch = useAppDispatch()

  const roomId: string | null = searchParams.get("room")
  const tableId: string | null = searchParams.get("table")

  if (!roomId || !tableId) {
    throw new Error("Room ID and Table ID are required")
  }

  const { t } = useLingui()
  const { data: session } = authClient.useSession()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket?.isConnected)
  const isJoinedTable: boolean = useAppSelector((state: RootState) => selectTableIsJoined(state, tableId))
  const tableInfo: ITowersTable | null = useAppSelector((state: RootState) => selectTableInfo(state, tableId))
  const isInfoLoading: boolean = useAppSelector((state: RootState) => selectIsTableInfoLoading(state, tableId))
  const chat: ITowersTableChatMessage[] = useAppSelector((state: RootState) => selectTableChat(state, tableId))
  const isChatLoading: boolean = useAppSelector((state: RootState) => selectIsTableChatLoading(state, tableId))
  const tableUsers: ITowersUserProfile[] = useAppSelector((state: RootState) => selectTableUsers(state, tableId))
  const formRef: RefObject<HTMLFormElement | null> = useRef<HTMLFormElement | null>(null)
  const messageInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement | null>(null)
  const [tableType, setTableType] = useState<string>(TableType.PUBLIC)
  const [isRated, setIsRated] = useState<boolean>(true)
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState<boolean>(false)
  const [isBootUserModalOpen, setIsBootUserModalOpen] = useState<boolean>(false)
  const [isGameState, setGameState] = useState<GameState>(GameState.LOBBY)
  const [errorMessages, setErrorMessages] = useState<ChangeTableOptionsFormValidationErrors>({})
  const [winningPlayer, setWinningPlayer] = useState<string>("the_player1")
  const [controls, setControls] = useState<Record<string, { label: string; key: string }>>({
    left: { label: t({ message: "Left Arrow" }), key: "ArrowLeft" },
    right: { label: t({ message: "Right Arrow" }), key: "ArrowRight" },
    drop: { label: t({ message: "Drop Arrow" }), key: "ArrowDown" },
    cycleColor: { label: t({ message: "Up Arrow" }), key: "ArrowUp" },
    useItem: { label: t({ message: "Space Bar" }), key: "Space" },
  })
  const activePlayer: string = "the_player1"
  const targetPlayer: string = "the_player1abcdefghijklmnopqrstuvwxyz"
  const pieceName: string = t({ message: "midas piece" })
  const { seatedSeats, seatsSwap, gameStartCountdown, handleChooseSeat, handleReady } = useSeatAssignment()

  const handleOpenBootUserModal = (): void => setIsBootUserModalOpen(true)
  const handleCloseBootUserModal = (): void => setIsBootUserModalOpen(false)

  const handleOpenInviteUserModal = (): void => setIsInviteUserModalOpen(true)
  const handleCloseInviteUserModal = (): void => setIsInviteUserModalOpen(false)

  const handleTableTypeChange = (tableType: string): void => {
    dispatch(
      addChatMessageToTable({
        roomId,
        tableId,
        messageVariables: { tableType },
        type: TableChatMessageType.TABLE_TYPE,
      }),
    )
  }

  const handleOptionChange = (): void => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit()
      }
    }, 1500)
  }

  const handleFormValidation = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    const formElement: EventTarget & HTMLFormElement = event.currentTarget
    const formData: FormData = new FormData(formElement)
    const payload: ChangeTableOptionsPayload = {
      tableType: formData.get("tableType") as TableType,
      rated: formData.get("rated") === "on",
    }
    const errors: ValueError[] = Array.from(Value.Errors(changeTableOptionsSchema, payload))

    for (const error of errors) {
      switch (error.path.replace("/", "")) {
        case "tableType":
          setErrorMessages((prev: ChangeTableOptionsFormValidationErrors) => ({
            ...prev,
            tableType: t({ message: "You must select a table type." }),
          }))
          break
        case "rated":
          setErrorMessages((prev: ChangeTableOptionsFormValidationErrors) => ({
            ...prev,
            rated: t({ message: "You must rate this game." }),
          }))
          break
        default:
          console.error(`Change Table Options Validation: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length === 0) {
      await handleChangeTableOptions(payload)
    }
  }

  const handleChangeTableOptions = async (body: ChangeTableOptionsPayload): Promise<void> => {
    try {
      const response: Response = await fetch(`/api/tables/${tableId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result = await response.json()
      dispatch(updateRoomTable({ roomId, tableId, table: result.data }))
    } catch (error) {
      dispatch(tableErrorMessage({ roomId, tableId, message: error as string }))
    }
  }

  const handleSendMessage = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter" && messageInputRef.current) {
      const message: string = messageInputRef.current.value.trim()

      if (message !== "") {
        dispatch(addChatMessageToTable({ roomId, tableId, message }))
        messageInputRef.current.value = ""
      }
    }
  }

  const handleQuitTable = (): void => {
    dispatch(leaveTable({ roomId, tableId }))
    dispatch(removeLink(`${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`))
    router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
  }

  useEffect(() => {
    if (isConnected) {
      if (isJoinedTable) {
        dispatch(fetchTableInfo({ roomId, tableId }))
        dispatch(fetchTableChat({ roomId, tableId }))
        dispatch(fetchTableUsers({ roomId, tableId }))
      } else {
        dispatch(joinTable({ roomId, tableId }))
      }
    }
  }, [isConnected, isJoinedTable, dispatch])

  useEffect(() => {
    if (tableInfo) {
      setIsRated(tableInfo.rated)
      setTableType(tableInfo.tableType)
    }
  }, [tableInfo])

  useEffect(() => {
    if (tableInfo) {
      dispatch(
        addLinks([
          {
            href: `${ROUTE_TOWERS.PATH}?room=${roomId}`,
            label: tableInfo?.room?.name,
          },
          {
            href: `${ROUTE_TOWERS.PATH}?room=${roomId}&table=${tableId}`,
            label: `${tableInfo?.room?.name} - Table ${tableInfo.tableNumber}`,
          },
        ]),
      )
    }
  }, [tableInfo])

  return (
    <>
      <form ref={formRef} noValidate onSubmit={handleFormValidation}>
        <div className="grid [grid-template-areas:'banner_banner_banner''sidebar_content_content''sidebar_content_content'] grid-rows-game grid-cols-game h-screen -m-4 -mb-8 bg-gray-100 text-black">
          <TableHeader table={tableInfo} />

          {/* Left sidebar */}
          <div className="[grid-area:sidebar] flex flex-col justify-between p-2 bg-gray-200">
            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={isInfoLoading}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {}}
              >
                <Trans>Start</Trans>
              </Button>
              <hr className="border-1 border-gray-400" />
              <Button className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
                <Trans>Change Keys</Trans>
              </Button>
              <Button className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
                <Trans>Demo</Trans>
              </Button>
              <hr className="border-1 border-gray-400" />
              <Button
                className="w-full"
                disabled={isInfoLoading}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {}}
              >
                <Trans>Stand</Trans>
              </Button>
              <div>
                <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">
                  <Trans>Table Type</Trans>
                </span>
              </div>
              <Select
                id="tableType"
                defaultValue={tableType}
                disabled={isInfoLoading || session?.user.id !== tableInfo?.host?.userId}
                onChange={(tableType: string) => {
                  setTableType(tableType)
                  handleOptionChange()
                  handleTableTypeChange(tableType)
                }}
              >
                <Select.Option value={TableType.PUBLIC}>
                  <Trans>Public</Trans>
                </Select.Option>
                <Select.Option value={TableType.PROTECTED}>
                  <Trans>Protected</Trans>
                </Select.Option>
                <Select.Option value={TableType.PRIVATE}>
                  <Trans>Private</Trans>
                </Select.Option>
              </Select>
              <Button
                className="w-full"
                disabled={isInfoLoading || session?.user.id !== tableInfo?.host?.userId}
                onClick={handleOpenInviteUserModal}
              >
                <Trans>Invite</Trans>
              </Button>
              <Button
                className="w-full"
                disabled={isInfoLoading || session?.user.id !== tableInfo?.host?.userId}
                onClick={handleOpenBootUserModal}
              >
                <Trans>Boot</Trans>
              </Button>
              <div>
                <span className="p-1 rounded-tl rounded-tr bg-sky-700 text-white text-sm">
                  <Trans>Options</Trans>
                </span>
              </div>
              <Checkbox
                id="rated"
                label={t({ message: "Rated Game" })}
                defaultChecked={isRated}
                disabled={isInfoLoading || session?.user.id !== tableInfo?.host?.userId}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setIsRated(event.target.checked)
                  handleOptionChange()
                }}
              />
              <Checkbox
                id="sound"
                label={t({ message: "Sound" })}
                disabled
                onChange={(event: ChangeEvent<HTMLInputElement>) => console.log(event.target.checked)}
              />
            </div>
            <div className="flex gap-1">
              <Button className="w-full" disabled onClick={(event: MouseEvent<HTMLButtonElement>) => {}}>
                <Trans>Help</Trans>
              </Button>
              <Button className="w-full" onClick={handleQuitTable}>
                <Trans>Quit</Trans>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="[grid-area:content] grid [grid-template-areas:'seats''chat'] grid-rows-game-content gap-2 px-2 pb-2">
            {/* Seats */}
            <div className="[grid-area:seats] flex flex-col border bg-white">
              <div className="flex items-center w-full h-full border bg-neutral-50">
                <div className="relative grid grid-rows-table-team grid-cols-table-team w-fit p-2 mx-auto bg-neutral-50">
                  {/* Game countdown */}
                  {isGameState === GameState.COUNTDOWN && (
                    <div
                      className={clsx(
                        "absolute start-1/2 -translate-x-1/2 bottom-[8px] z-30 flex flex-col items-center w-[450px] h-48 p-1 border-2 border-gray-400 bg-gray-200 shadow-lg",
                        "rtl:translate-x-1/2",
                      )}
                    >
                      <Trans>
                        <div className="text-2xl">The next game is starting in</div>
                        <div className="flex-1 flex items-center text-7xl text-orange-400 font-semibold normal-nums">
                          {gameStartCountdown}
                        </div>
                        <div className="text-2xl">seconds</div>
                      </Trans>
                    </div>
                  )}

                  {/* Game over */}
                  {isGameState === GameState.GAME_OVER && (
                    <div className="absolute start-0 top-0 gap-8 z-30 flex flex-col justify-start items-center w-full h-max p-1 mt-16 font-medium [text-shadow:_4px_4px_0_rgb(0_0_0)] animate-move-up">
                      <div className="text-8xl text-fuchsia-600">
                        <Trans>Game Over</Trans>
                      </div>
                      <div className="text-6xl text-yellow-400">
                        <Trans>You win!</Trans>
                      </div>
                      <div className="flex flex-col gap-8 items-center text-6xl">
                        <div className="text-yellow-400">
                          <Trans>You lose!</Trans>
                        </div>
                        <Trans>
                          <div className="text-fuchsia-600">Congratulations</div>
                          <div className="text-fuchsia-600">{winningPlayer}</div>
                        </Trans>
                      </div>
                    </div>
                  )}

                  {/* Controls and game timer */}
                  <div className="row-span-3 flex flex-col justify-evenly items-start gap-2 px-2 pb-2 text-lg">
                    <div className="text-sm">
                      <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <div>
                          <Trans>Left:</Trans>
                        </div>{" "}
                        <div className="text-gray-500">{controls.left.label}</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <div>
                          <Trans>Right:</Trans>
                        </div>{" "}
                        <div className="text-gray-500">{controls.right.label}</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <div>
                          <Trans>Drop:</Trans>
                        </div>{" "}
                        <div className="text-gray-500">{controls.drop.label}</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <div>
                          <Trans>Cycle Color:</Trans>
                        </div>{" "}
                        <div className="text-gray-500">{controls.cycleColor.label}</div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <div>
                          <Trans>Use Item:</Trans>
                        </div>{" "}
                        <div className="text-gray-500">{controls.useItem.label}</div>
                      </div>
                    </div>
                    <Timer isActive={isGameState === GameState.STARTED} />
                  </div>

                  {/* Game */}
                  {seatsSwap.map((group: TowersTeam, index: number) => (
                    <div
                      key={index}
                      className={clsx(
                        `row-span-${group.rowSpan}`,
                        index === 0 && "flex flex-row justify-center items-start h-max",
                      )}
                      dir="ltr"
                    >
                      <div className={index === 0 ? "contents" : "flex flex-row justify-center items-center"}>
                        {group.seats.map((seat: TowersSeat) => (
                          <PlayerBoard
                            key={seat.number}
                            seatNumber={seat.number}
                            user={seat.user}
                            isOpponentBoard={group.teamNumber > 1}
                            isReversed={seat.number % 2 === 0}
                            isSeated={seatedSeats.has(seat.number)}
                            isReady={seat.isReady}
                            onChooseSeat={handleChooseSeat}
                            onReady={handleReady}
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

                  <div className="row-span-1 flex flex-col justify-start w-[488px] px-2 mt-2 bg-neutral-200 text-sm font-mono">
                    {/* Next power to be used by current player */}
                    <span className="w-full truncate">
                      <Trans>You can send a {pieceName}</Trans>
                    </span>
                    {/* Power used by other players */}
                    <span className="w-full text-gray-500 truncate">
                      <Trans>
                        {activePlayer} mega defused {targetPlayer}
                      </Trans>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat and users list */}
            <div className="[grid-area:chat] flex gap-2">
              <div className="overflow-hidden flex-1 flex flex-col gap-1 border bg-white">
                <ServerMessage roomId={roomId} tableId={tableId} />

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
                  users={tableUsers}
                  isRatingsVisible={tableInfo?.room && tableInfo?.room?.difficulty !== RoomLevel.SOCIAL}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      <TableInviteUser
        key={createId()}
        tableId={tableId}
        isOpen={isInviteUserModalOpen}
        isRatingsVisible={tableInfo?.room && tableInfo?.room?.difficulty !== RoomLevel.SOCIAL}
        onCancel={handleCloseInviteUserModal}
      />

      <TableBootUser
        key={createId()}
        tableId={tableId}
        isOpen={isBootUserModalOpen}
        isRatingsVisible={tableInfo?.room && tableInfo?.room?.difficulty !== RoomLevel.SOCIAL}
        onCancel={handleCloseBootUserModal}
      />
    </>
  )
}

const TableHeader = dynamic(() => import("@/components/game/TableHeader"), {
  loading: () => <TableHeaderSkeleton />,
})

const Chat = dynamic(() => import("@/components/game/Chat"), {
  loading: () => <ChatSkeleton />,
})

const PlayersList = dynamic(() => import("@/components/game/PlayersList"), {
  loading: () => <PlayersListSkeleton />,
})

const changeTableOptionsSchema = Type.Object({
  tableType: Type.Union([
    Type.Literal(TableType.PUBLIC),
    Type.Literal(TableType.PROTECTED),
    Type.Literal(TableType.PRIVATE),
  ]),
  rated: Type.Boolean(),
})

type ChangeTableOptionsPayload = FormPayload<typeof changeTableOptionsSchema>
type ChangeTableOptionsFormValidationErrors = FormValidationErrors<keyof ChangeTableOptionsPayload>
