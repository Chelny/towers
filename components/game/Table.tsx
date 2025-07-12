"use client"

import React, { ChangeEvent, FormEvent, MouseEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { Plural, Trans, Select as TransSelect, useLingui } from "@lingui/react/macro"
import { Type } from "@sinclair/typebox"
import { Value, ValueError } from "@sinclair/typebox/value"
import clsx from "clsx/lite"
import { RoomLevel } from "db"
import JoiningScreen from "@/components/game/JoiningScreen"
import ServerMessage from "@/components/game/ServerMessage"
import TableBootUserModal from "@/components/game/TableBootUserModal"
import TableChangeKeysPanel from "@/components/game/TableChangeKeysPanel"
import TableGameDemoPanel from "@/components/game/TableGameDemoPanel"
import TableInviteUserModal from "@/components/game/TableInviteUserModal"
import Timer from "@/components/game/Timer"
import ChatSkeleton from "@/components/skeleton/ChatSkeleton"
import PlayersListSkeleton from "@/components/skeleton/PlayersListSkeleton"
import TableHeaderSkeleton from "@/components/skeleton/TableHeaderSkeleton"
import PlayerBoard from "@/components/towers/PlayerBoard"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import { InputImperativeHandle } from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { FKey, fKeyMessages } from "@/constants/f-key-messages"
import { DEFAULT_TOWERS_CONTROL_KEYS } from "@/constants/game"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useGame } from "@/context/GameContext"
import { useModal } from "@/context/ModalContext"
import { useSocket } from "@/context/SocketContext"
import { TableChatMessageType } from "@/enums/table-chat-message-type"
import { TablePanelView } from "@/enums/table-panel-view"
import { TableType } from "@/enums/table-type"
import { TowersControlKeys } from "@/enums/towers-control-keys"
import { TowersGameState } from "@/enums/towers-game-state"
import { getReadableKeyLabel } from "@/lib/keyboard/get-readable-key-label"
import { logger } from "@/lib/logger"
import { PowerBarItemPlainObject } from "@/server/towers/classes/PowerBar"
import { RoomPlainObject } from "@/server/towers/classes/Room"
import { ServerTowersSeat, ServerTowersTeam, TablePlainObject } from "@/server/towers/classes/Table"
import { TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation"
import { UserPlainObject } from "@/server/towers/classes/User"

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
  isRated: Type.Boolean(),
})

type ChangeTableOptionsPayload = FormPayload<typeof changeTableOptionsSchema>
type ChangeTableOptionsFormValidationErrors = FormValidationErrors<keyof ChangeTableOptionsPayload>

export default function Table(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()

  const roomId: string | null = searchParams.get("room")
  const tableId: string | null = searchParams.get("table")

  if (!roomId || !tableId) {
    throw new Error("Room ID and Table ID are required")
  }

  const { i18n, t } = useLingui()
  const { socketRef, isConnected, session } = useSocket()
  const { addJoinedTable, removeJoinedTable } = useGame()
  const { openModal } = useModal()
  const hasJoinedRef: React.RefObject<boolean> = useRef<boolean>(false)
  const [hasJoined, setHasJoined] = useState<boolean>(false)
  const joinedTableSidebarRef = useRef<Set<string>>(new Set<string>())
  const formRef = useRef<HTMLFormElement>(null)
  const messageInputRef = useRef<InputImperativeHandle>(null)
  const [room, setRoom] = useState<RoomPlainObject>()
  const [table, setTable] = useState<TablePlainObject>()
  const [user, setUser] = useState<UserPlainObject>()
  const [seats, setSeats] = useState<ServerTowersTeam[]>([])
  const [gameState, setGameState] = useState<TowersGameState>(TowersGameState.WAITING)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timer, setTimer] = useState<number | null>(null)
  const [winnersCount, setWinnersCount] = useState<number>(0)
  const [firstWinner, setFirstWinner] = useState<string | undefined>(undefined)
  const [secondWinner, setSecondWinner] = useState<string | undefined>(undefined)
  const [isWinner, setIsWinner] = useState<boolean>(false)
  const [isPlayedThisRound, setIsPlayedThisRound] = useState<boolean>(false)
  const [errorMessages, setErrorMessages] = useState<ChangeTableOptionsFormValidationErrors>({})
  const [gameOverAnimationClass, setGameOverAnimationClass] = useState("animate-move-up")
  const [view, setView] = useState<TablePanelView>(TablePanelView.GAME)
  const [controlKeys, setControlKeys] = useState<TowersControlKeys>(DEFAULT_TOWERS_CONTROL_KEYS)
  const [seatNumber, setSeatNumber] = useState<number | undefined>(undefined)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [nextPowerBarItem, setNextPowerBarItem] = useState<PowerBarItemPlainObject | undefined>(undefined)
  const [usedPowerItem, setUsedPowerItem] = useState<
    { sourceUsername: string; targetUsername: string; powerItem: PowerBarItemPlainObject } | undefined
  >(undefined)
  const [usedPowerItemTextOpacity, setUsedPowerItemTextOpacity] = useState<number>(1)
  const isDone: boolean = hasJoined && !!table

  const readyTeamsCount: number = useMemo(() => {
    let count: number = 0

    for (const team of seats) {
      const seatedUsers: UserPlainObject[] = team.seats
        .map((seat: ServerTowersSeat) => seat.occupiedBy)
        .filter((user: UserPlainObject | undefined): user is UserPlainObject => !!user)

      if (seatedUsers.length > 0 && seatedUsers.every((user: UserPlainObject) => user.tables[tableId]?.isReady)) {
        count++
      }
    }

    return count
  }, [seats])

  const handleOptionChange = (): void => {
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit()
      }
    }, 1500)
  }

  const handleFormValidation = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()

    const formElement: EventTarget & HTMLFormElement = event.currentTarget
    const formData: FormData = new FormData(formElement)
    const payload: ChangeTableOptionsPayload = {
      tableType: formData.get("tableType") as TableType,
      isRated: formData.get("isRated") === "on",
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
        case "isRated":
          setErrorMessages((prev: ChangeTableOptionsFormValidationErrors) => ({
            ...prev,
            isRated: t({ message: "You must rate this game." }),
          }))
          break
        default:
          logger.warn(`Change Table Options Validation: Unknown error at ${error.path}`)
          break
      }
    }

    if (Object.keys(errorMessages).length === 0) {
      handleChangeTableOptions(payload)
    }
  }

  const handleChangeTableOptions = (body: ChangeTableOptionsPayload): void => {
    if (!table) return

    const payload: {
      roomId: string
      tableId: string
      tableType?: TableType
      isRated?: boolean
    } = {
      roomId,
      tableId,
    }

    if (body.tableType !== table.tableType) {
      payload.tableType = body.tableType
    }

    if (body.isRated !== table.isRated) {
      payload.isRated = body.isRated
    }

    if (typeof payload.tableType !== "undefined" || typeof payload.isRated !== "undefined") {
      socketRef.current?.emit(SocketEvents.TABLE_UPDATE_SETTINGS, payload)
    }
  }

  const handleOpenInviteUserModal = (): void => {
    openModal(TableInviteUserModal, {
      roomId,
      tableId,
      usersToInvite: table?.usersToInvite ?? [],
      isRatingsVisible: room?.level !== RoomLevel.SOCIAL,
    })
  }

  const handleOpenBootUserModal = (): void => {
    openModal(TableBootUserModal, {
      roomId,
      tableId,
      hostId: table?.host?.user?.id,
      usersToBoot: table?.usersToBoot ?? [],
      isRatingsVisible: room?.level !== RoomLevel.SOCIAL,
    })
  }

  const handleSit = (seatNumber: number): void => {
    socketRef.current?.emit(SocketEvents.SEAT_SIT, { roomId, tableId, seatNumber })
  }

  const handleStand = (): void => {
    socketRef.current?.emit(SocketEvents.SEAT_STAND, { roomId, tableId })
  }

  const handleStart = (): void => {
    socketRef.current?.emit(SocketEvents.SEAT_READY, { roomId, tableId, isReady: true })
  }

  const renderNextPowerBarItemText = (item: PowerBarItemPlainObject | undefined): ReactNode => {
    if (!item || !("powerType" in item)) return null

    if (item.letter === "SD") {
      return <Trans>You can use a special cell</Trans>
    }

    const { letter, powerType, powerLevel } = item

    // Attack powers
    if (powerType === "attack") {
      if (letter === "T") {
        return <Trans>You can add a row</Trans>
      } else if (letter === "O") {
        return (
          <TransSelect
            value={powerLevel}
            _minor="You can minorly dither"
            _mega="You can mega dither"
            other="You can dither"
          />
        )
      } else if (letter === "W") {
        return (
          <TransSelect
            value={powerLevel}
            _minor="You can add a stone"
            _normal="You can add 2 stones"
            _mega="You can add 3 stones"
            other="You can add stones"
          />
        )
      } else if (letter === "E") {
        return (
          <TransSelect
            value={powerLevel}
            _minor="You can minorly defuse"
            _mega="You can mega defuse"
            other="You can defuse"
          />
        )
      } else if (letter === "R") {
        return <Trans>You can send a Medusa piece</Trans>
      } else if (letter === "S") {
        return (
          <TransSelect
            value={powerLevel}
            _minor="You can minorly remove powers"
            _mega="You can mega remove powers"
            other="You can remove powers"
          />
        )
      }
    }

    // Defense powers
    if (powerType === "defense") {
      if (letter === "T") {
        return <Trans>You can remove a row</Trans>
      } else if (letter === "O") {
        return (
          <TransSelect
            value={powerLevel}
            _minor="You can minorly clump"
            _mega="You can mega clump"
            other="You can clump"
          />
        )
      } else if (letter === "W") {
        return (
          <TransSelect
            value={powerLevel}
            _minor="You can drop a stone"
            _normal="You can drop 2 stones"
            _mega="You can drop 3 stones"
            other="You can drop stones"
          />
        )
      } else if (letter === "E") {
        return <Trans>You can color blast</Trans>
      } else if (letter === "R") {
        return <Trans>You can send a Midas piece</Trans>
      } else if (letter === "S") {
        return <Trans>You can send a color plague</Trans>
      }
    }

    return null
  }

  const renderUsedPowerItemText = (
    obj: { sourceUsername: string; targetUsername: string; powerItem: PowerBarItemPlainObject } | undefined,
  ): ReactNode => {
    if (!obj) return null

    const { sourceUsername, targetUsername, powerItem } = obj

    if (powerItem.letter === "SD") {
      return (
        <Trans>
          {sourceUsername} used a special cell on {targetUsername}
        </Trans>
      )
    }

    const { letter, powerType, powerLevel } = powerItem

    // Attack
    if (powerType === "attack") {
      if (letter === "T") {
        return (
          <Trans>
            {sourceUsername} added a row to {targetUsername}
          </Trans>
        )
      } else if (letter === "O") {
        return (
          <TransSelect
            value={powerLevel}
            _minor={`${sourceUsername} minorly dithered ${targetUsername}`}
            _mega={`${sourceUsername} mega dithered ${targetUsername}`}
            other={`${sourceUsername} dithered ${targetUsername}`}
          />
        )
      } else if (letter === "W") {
        return (
          <Trans>
            {sourceUsername} stoned {targetUsername}
          </Trans>
        )
      } else if (letter === "E") {
        return (
          <TransSelect
            value={powerLevel}
            _minor={`${sourceUsername} minorly defused ${targetUsername}`}
            _mega={`${sourceUsername} mega defused ${targetUsername}`}
            other={`${sourceUsername} defused ${targetUsername}`}
          />
        )
      } else if (letter === "R") {
        return (
          <Trans>
            {sourceUsername} sent a Medusa piece to {targetUsername}
          </Trans>
        )
      } else if (letter === "S") {
        return (
          <Trans>
            {sourceUsername} removed powers from {targetUsername}
          </Trans>
        )
      }
    }

    // Defense
    if (powerType === "defense") {
      if (letter === "T") {
        return (
          <Trans>
            {sourceUsername} removed a row from {targetUsername}
          </Trans>
        )
      } else if (letter === "O") {
        return (
          <Trans>
            {sourceUsername} clumped {targetUsername}
          </Trans>
        )
      } else if (letter === "W") {
        const value: number | undefined =
          powerLevel === "minor" ? 1 : powerLevel === "normal" ? 2 : powerLevel === "mega" ? 3 : undefined
        return (
          <Plural
            value={value}
            one={`${sourceUsername} dropped 1 stone for ${targetUsername}`}
            two={`${sourceUsername} dropped 2 stones for ${targetUsername}`}
            _3={`${sourceUsername} dropped 3 stones for ${targetUsername}`}
            other={`${sourceUsername} dropped stones for ${targetUsername}`}
          />
        )
      } else if (letter === "E") {
        return (
          <Trans>
            {sourceUsername} color blasted {targetUsername}
          </Trans>
        )
      } else if (letter === "R") {
        return (
          <Trans>
            {sourceUsername} sent a Midas piece to {targetUsername}
          </Trans>
        )
      } else if (letter === "S") {
        return (
          <Trans>
            {sourceUsername} sent a color plague to {targetUsername}
          </Trans>
        )
      }
    }

    return null
  }

  const handleSendMessage = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.code === "Enter" && messageInputRef.current?.value) {
      const text: string = messageInputRef.current.value.trim()

      if (socketRef.current && text !== "") {
        socketRef.current?.emit(SocketEvents.TABLE_MESSAGE_SEND, { roomId, tableId, text })
        messageInputRef.current.clear()
      }
    }
  }

  const handleQuitTable = (): void => {
    socketRef.current?.emit(
      SocketEvents.TABLE_LEAVE,
      { roomId, tableId },
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          removeJoinedTable(tableId)
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
        }
      },
    )
  }

  useEffect(() => {
    if (room && table && !joinedTableSidebarRef.current.has(table.id)) {
      addJoinedTable({
        id: table.id,
        roomId: room.id,
        roomName: room.name,
        tableNumber: table.tableNumber,
      })
      joinedTableSidebarRef.current.add(table.id)
    }
  }, [room, table])

  useEffect(() => {
    setSeatNumber(user?.tables?.[tableId]?.seatNumber)
    setIsReady(!!user?.tables?.[tableId]?.isReady)
  }, [user])

  useEffect(() => {
    if (!roomId || !tableId || hasJoinedRef.current) return

    hasJoinedRef.current = true

    socketRef.current?.emit(
      SocketEvents.TABLE_JOIN,
      { roomId, tableId },
      (response: { success: boolean; message: string }) => {
        if (response.success) {
          socketRef.current?.emit(SocketEvents.TABLE_GET, { roomId, tableId })
          setHasJoined(true)
        } else {
          router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
        }
      },
    )

    socketRef.current?.emit(SocketEvents.GAME_GET_CONTROL_KEYS)
  }, [roomId])

  useEffect(() => {
    if (!roomId || !tableId || !hasJoinedRef.current) return

    const handleTableData = ({ room, table }: { room: RoomPlainObject; table: TablePlainObject }): void => {
      setRoom(room)
      setTable(table)
    }

    const handleTableUpdate = (): void => {
      socketRef.current?.emit(SocketEvents.TABLE_GET, { roomId, tableId })
    }

    const handleControlKeys = ({ controlKeys }: { controlKeys: TowersControlKeys }): void => {
      setControlKeys(controlKeys)
    }

    const handleGameState = ({ gameState }: { gameState: TowersGameState }): void => {
      setGameState(gameState)
    }

    const handleCountdown = ({ countdown }: { countdown: number }): void => {
      setCountdown(countdown)
    }

    const handleTimer = ({ timer }: { timer: number }): void => {
      setTimer(timer)
    }

    const handlePowerFire = ({
      sourceUsername,
      targetUsername,
      targetSeatNumber,
      powerItem,
    }: {
      sourceUsername: string
      targetUsername: string
      targetSeatNumber: number
      powerItem: PowerBarItemPlainObject
    }): void => {
      if (seatNumber === targetSeatNumber) {
        socketRef.current?.emit(SocketEvents.GAME_POWER_APPLY, { sourceUsername, targetUsername, powerItem })
      }

      setUsedPowerItem({ sourceUsername, targetUsername, powerItem })
    }

    const handleGameOver = ({
      winners,
      isWinner,
      isPlayedThisRound,
    }: {
      winners: UserPlainObject[]
      isWinner: boolean
      isPlayedThisRound: boolean
    }): void => {
      setWinnersCount(winners?.length)

      switch (winners.length) {
        case 1:
          setFirstWinner(winners[0].user?.username)
          break
        case 2:
          setFirstWinner(winners[0].user?.username)
          setSecondWinner(winners[1].user?.username)
          break
        default:
          setFirstWinner(undefined)
          setSecondWinner(undefined)
          break
      }

      setIsWinner(isWinner)
      setIsPlayedThisRound(isPlayedThisRound)
    }

    socketRef.current?.on(SocketEvents.TABLE_DATA, handleTableData)
    socketRef.current?.on(SocketEvents.TABLE_DATA_UPDATED, handleTableUpdate)
    socketRef.current?.on(SocketEvents.TABLE_CHAT_UPDATED, handleTableUpdate)
    socketRef.current?.on(SocketEvents.GAME_CONTROL_KEYS, handleControlKeys)
    socketRef.current?.on(SocketEvents.GAME_STATE, handleGameState)
    socketRef.current?.on(SocketEvents.GAME_COUNTDOWN, handleCountdown)
    socketRef.current?.on(SocketEvents.GAME_TIMER, handleTimer)
    socketRef.current?.on(SocketEvents.GAME_POWER_FIRE, handlePowerFire)
    socketRef.current?.on(SocketEvents.GAME_OVER, handleGameOver)

    return () => {
      socketRef.current?.off(SocketEvents.TABLE_DATA, handleTableData)
      socketRef.current?.off(SocketEvents.TABLE_DATA_UPDATED, handleTableUpdate)
      socketRef.current?.off(SocketEvents.TABLE_CHAT_UPDATED, handleTableUpdate)
      socketRef.current?.off(SocketEvents.GAME_CONTROL_KEYS, handleControlKeys)
      socketRef.current?.off(SocketEvents.GAME_STATE, handleGameState)
      socketRef.current?.off(SocketEvents.GAME_COUNTDOWN, handleCountdown)
      socketRef.current?.off(SocketEvents.GAME_TIMER, handleTimer)
      socketRef.current?.off(SocketEvents.GAME_POWER_FIRE, handlePowerFire)
      socketRef.current?.off(SocketEvents.GAME_OVER, handleGameOver)
    }
  }, [roomId, tableId, seatNumber, hasJoinedRef.current])

  useEffect(() => {
    if (!table) return

    setUser(table.users?.find((user: UserPlainObject) => user.user?.id === session?.user.id))
  }, [table, session?.user.id])

  useEffect(() => {
    if (!table?.seats) return

    setSeats(() => {
      if (typeof seatNumber === "undefined") return table.seats

      const updatedSeats: ServerTowersTeam[] = structuredClone(table.seats)

      const selectedTeamIndex: number = updatedSeats.findIndex((team: ServerTowersTeam) =>
        team.seats.some((seat: ServerTowersSeat) => seat.seatNumber === seatNumber),
      )

      if (selectedTeamIndex <= 0) return updatedSeats

      // Swap the selected team with the first team (teamNumber = 1)
      const selectedTeam: ServerTowersTeam = updatedSeats[selectedTeamIndex]
      const firstTeam: ServerTowersTeam = updatedSeats[0]

      // Swap the teams
      updatedSeats[selectedTeamIndex] = firstTeam
      updatedSeats[0] = selectedTeam

      // Swap `targetNumber` values between seats of both teams
      for (let i = 0; i < Math.min(selectedTeam.seats.length, firstTeam.seats.length); i++) {
        const temp: number = selectedTeam.seats[i].targetNumber
        selectedTeam.seats[i].targetNumber = firstTeam.seats[i].targetNumber
        firstTeam.seats[i].targetNumber = temp
      }

      return updatedSeats
    })
  }, [table?.seats, seatNumber])

  useEffect(() => {
    const handleFKeyMessage = (event: KeyboardEvent): void => {
      const keyCode: FKey = event.code as FKey

      if (keyCode in fKeyMessages) {
        event.preventDefault()
        socketRef.current?.emit(SocketEvents.TABLE_MESSAGE_SEND, {
          roomId,
          tableId,
          type: TableChatMessageType.F_KEY,
          messageVariables: { username: session?.user.username, fKey: keyCode },
        })
      }
    }

    window.addEventListener("keydown", handleFKeyMessage)

    return () => {
      window.removeEventListener("keydown", handleFKeyMessage)
    }
  }, [roomId, tableId])

  useEffect(() => {
    if (gameState === TowersGameState.GAME_OVER) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        setGameOverAnimationClass("animate-move-down")
      }, 9000)

      return () => clearTimeout(timer)
    } else if (gameOverAnimationClass === "animate-move-down") {
      setGameOverAnimationClass("animate-move-up")
    }
  }, [gameState])

  useEffect(() => {
    setUsedPowerItemTextOpacity(1)

    let current: number = 1.0
    const step: number = 0.04 // Decrease by 4% at a time
    const min: number = 0.6

    const interval: NodeJS.Timeout = setInterval(() => {
      current = Math.max(min, current - step)
      setUsedPowerItemTextOpacity(current)

      if (current <= min) {
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [usedPowerItem])

  if (!hasJoined || !table) {
    return (
      <JoiningScreen
        title={t({ message: "Joining table" })}
        subtitle={t({ message: "Please wait while we connect you to the table..." })}
        isDone={isDone}
        onCancel={() => router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)}
      />
    )
  }

  return (
    <>
      <form ref={formRef} noValidate onSubmit={handleFormValidation}>
        <div
          className={clsx(
            "grid [grid-template-areas:'banner_banner_banner''sidebar_content_content''sidebar_content_content'] grid-rows-(--grid-rows-game) grid-cols-(--grid-cols-game) h-screen -m-4 -mb-8",
            "dark:bg-dark-game-background",
          )}
        >
          <TableHeader room={room} table={table} />

          {/* Left sidebar */}
          <div
            className={clsx(
              "[grid-area:sidebar] flex flex-col justify-between p-2 bg-gray-200",
              "dark:bg-dark-game-sidebar-background",
            )}
          >
            <div className="flex flex-col gap-2">
              <Button
                className="w-full"
                disabled={
                  !isConnected || typeof seatNumber === "undefined" || isReady || gameState === TowersGameState.PLAYING
                }
                onClick={handleStart}
              >
                <Trans>Start</Trans>
              </Button>
              <hr className={clsx("border-1 border-gray-400", "dark:border-slate-500")} />
              <Button
                className="w-full"
                disabled={!isConnected || view === TablePanelView.CHANGE_KEYS || gameState === TowersGameState.PLAYING}
                onClick={() => setView(TablePanelView.CHANGE_KEYS)}
              >
                <Trans>Change Keys</Trans>
              </Button>
              <Button
                className="w-full"
                disabled={!isConnected || view === TablePanelView.DEMO || gameState === TowersGameState.PLAYING}
                onClick={() => setView(TablePanelView.DEMO)}
              >
                <Trans>Demo</Trans>
              </Button>
              <hr className={clsx("border-1 border-gray-400", "dark:border-slate-500")} />
              <Button
                className="w-full"
                disabled={!isConnected || typeof seatNumber === "undefined"}
                onClick={handleStand}
              >
                <Trans>Stand</Trans>
              </Button>
              <div>
                <span className="p-1 rounded-tl-sm rounded-tr-sm bg-sky-700 text-white text-sm">
                  <Trans>Table Type</Trans>
                </span>
              </div>
              <Select
                id="tableType"
                defaultValue={table?.tableType}
                disabled={!isConnected || session?.user.id !== table?.host?.user?.id}
                isNoBottomSpace
                onChange={() => {
                  handleOptionChange()
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
                disabled={!isConnected || session?.user.id !== table?.host?.user?.id}
                onClick={handleOpenInviteUserModal}
              >
                <Trans>Invite</Trans>
              </Button>
              <Button
                className="w-full"
                disabled={!isConnected || session?.user.id !== table?.host?.user?.id}
                onClick={handleOpenBootUserModal}
              >
                <Trans>Boot</Trans>
              </Button>
              <div>
                <span className="p-1 rounded-tl-sm rounded-tr-sm bg-sky-700 text-white text-sm">
                  <Trans>Options</Trans>
                </span>
              </div>
              <Checkbox
                id="isRated"
                label={t({ message: "Rated Game" })}
                defaultChecked={table?.isRated}
                disabled={
                  !isConnected ||
                  session?.user.id !== table?.host?.user?.id ||
                  gameState === TowersGameState.COUNTDOWN ||
                  gameState === TowersGameState.PLAYING
                }
                isNoBottomSpace
                onChange={handleOptionChange}
              />
              <Checkbox
                id="sound"
                label={t({ message: "Sound" })}
                disabled
                isNoBottomSpace
                onChange={(event: ChangeEvent<HTMLInputElement>) => console.log(event.target.checked)}
              />
            </div>
            <div className="flex gap-1">
              <Button className="w-full" disabled onClick={(_: MouseEvent<HTMLButtonElement>) => {}}>
                <Trans>Help</Trans>
              </Button>
              <Button className="w-full" onClick={handleQuitTable}>
                <Trans>Quit</Trans>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="[grid-area:content] grid [grid-template-areas:'seats''chat'] grid-rows-(--grid-rows-game-content) gap-2 px-2 pb-2">
            {view === TablePanelView.CHANGE_KEYS ? (
              <TableChangeKeysPanel controlKeys={controlKeys} onChangeView={() => setView(TablePanelView.GAME)} />
            ) : view === TablePanelView.DEMO ? (
              <TableGameDemoPanel nextGameCountdown={countdown} onChangeView={() => setView(TablePanelView.GAME)} />
            ) : (
              <div
                className={clsx(
                  "[grid-area:seats] flex flex-col border border-gray-200",
                  "dark:border-dark-game-content-border",
                )}
              >
                <div
                  className={clsx(
                    "flex items-center w-full h-full border border-gray-200",
                    "dark:border-dark-game-content-border",
                  )}
                >
                  <div className="relative grid [grid-template-areas:'timer_team1_team3''timer_team1_team3''team2_team1_team4''team2_hint_team4'] grid-cols-(--grid-cols-table-team) w-fit p-2 mx-auto">
                    {/* Game countdown */}
                    {gameState === TowersGameState.COUNTDOWN && countdown !== null && (
                      <div
                        className={clsx(
                          "absolute start-1/2 -translate-x-1/2 bottom-[8px] z-30 flex flex-col items-center w-[450px] h-48 p-1 border-2 border-gray-400 bg-gray-200 shadow-lg",
                          "rtl:translate-x-1/2",
                        )}
                      >
                        <Trans>
                          <div className="text-2xl">The next game is starting in</div>
                          <div className="flex-1 flex items-center text-7xl text-orange-400 font-semibold normal-nums">
                            {countdown}
                          </div>
                          <div className="text-2xl">
                            <Plural value={countdown} one="second" other="seconds" />
                          </div>
                        </Trans>
                      </div>
                    )}

                    {/* Game over */}
                    {gameState === TowersGameState.GAME_OVER && (
                      <div
                        className={clsx(
                          "absolute start-0 top-0 gap-8 z-30 flex flex-col justify-start items-center w-full h-max p-1 mt-16 font-medium [text-shadow:_4px_4px_0_rgb(0_0_0)]",
                          gameOverAnimationClass,
                        )}
                      >
                        <div className="text-8xl text-fuchsia-600">
                          <Trans>Game Over</Trans>
                        </div>

                        {isPlayedThisRound && !isWinner && (
                          <div className="text-6xl text-yellow-400">
                            <Trans>You lose!</Trans>
                          </div>
                        )}

                        <div className="flex flex-col gap-8 items-center text-6xl text-center">
                          {isPlayedThisRound && isWinner && (
                            <div className="text-yellow-400">
                              <Trans>You win!</Trans>
                            </div>
                          )}
                          {winnersCount > 0 && (
                            <div className="text-fuchsia-600">
                              <Plural
                                value={winnersCount}
                                one={`Congratulations\n${firstWinner}`}
                                other={`Congratulations\n${firstWinner} and ${secondWinner}`}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Controls and game timer */}
                    <div className="[grid-area:timer] flex flex-col justify-evenly items-start gap-2 px-2 pb-2 text-lg">
                      <div className="text-sm">
                        <div className="grid grid-cols-[1fr_1fr] gap-2">
                          <div>
                            <Trans>Left:</Trans>
                          </div>{" "}
                          <div className={clsx("text-gray-500", "dark:text-dark-text-muted")}>
                            {getReadableKeyLabel(i18n, controlKeys.MOVE_LEFT)}
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr] gap-2">
                          <div>
                            <Trans>Right:</Trans>
                          </div>{" "}
                          <div className={clsx("text-gray-500", "dark:text-dark-text-muted")}>
                            {getReadableKeyLabel(i18n, controlKeys.MOVE_RIGHT)}
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr] gap-2">
                          <div>
                            <Trans>Drop:</Trans>
                          </div>{" "}
                          <div className={clsx("text-gray-500", "dark:text-dark-text-muted")}>
                            {getReadableKeyLabel(i18n, controlKeys.DROP)}
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr] gap-2">
                          <div>
                            <Trans>Cycle Color:</Trans>
                          </div>{" "}
                          <div className={clsx("text-gray-500", "dark:text-dark-text-muted")}>
                            {getReadableKeyLabel(i18n, controlKeys.CYCLE)}
                          </div>
                        </div>
                        <div className="grid grid-cols-[1fr_1fr] gap-2">
                          <div>
                            <Trans>Use Item:</Trans>
                          </div>{" "}
                          <div className={clsx("text-gray-500", "dark:text-dark-text-muted")}>
                            {getReadableKeyLabel(i18n, controlKeys.USE_ITEM)}
                          </div>
                        </div>
                      </div>
                      <Timer timer={timer} />
                    </div>

                    {/* Game */}
                    {seats.map((group: ServerTowersTeam, index: number) => {
                      const isUserSeatedAnywhere: boolean = seats.some((team: ServerTowersTeam) =>
                        team.seats.some((seat: ServerTowersSeat) => seat.occupiedBy?.user?.id === session?.user.id),
                      )

                      return (
                        <div
                          key={index}
                          className={clsx(index === 0 && "flex flex-row justify-center items-start h-max")}
                          style={{ gridArea: `team${index + 1}` }}
                          dir="ltr"
                        >
                          <div className={index === 0 ? "contents" : "flex flex-row justify-center items-center"}>
                            {group.seats.map((seat: ServerTowersSeat) => {
                              const isSitAccessGranted: boolean =
                                table.host?.user?.id === user?.user?.id ||
                                table.tableType === TableType.PUBLIC ||
                                ((table.tableType === TableType.PROTECTED || table.tableType === TableType.PRIVATE) &&
                                  !!user?.tableInvitations.received.some(
                                    (invitation: TableInvitationPlainObject) => invitation.tableId === table.id,
                                  ))

                              return (
                                <PlayerBoard
                                  key={seat.seatNumber}
                                  roomId={roomId}
                                  tableId={tableId}
                                  seat={seat}
                                  isOpponentBoard={index !== 0}
                                  gameState={gameState}
                                  readyTeamsCount={readyTeamsCount}
                                  isSitAccessGranted={isSitAccessGranted}
                                  isUserSeatedAnywhere={isUserSeatedAnywhere}
                                  currentUser={user}
                                  isRatingsVisible={room?.level !== RoomLevel.SOCIAL}
                                  onSit={handleSit}
                                  onStand={handleStand}
                                  onStart={handleStart}
                                  onNextPowerBarItem={(nextPowerBarItem: PowerBarItemPlainObject | undefined) =>
                                    setNextPowerBarItem(nextPowerBarItem)
                                  }
                                />
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    <div
                      className={clsx(
                        "[grid-area:hint] row-span-1 flex flex-col justify-start w-[488px] px-2 mt-2 bg-neutral-200 text-sm font-mono",
                        "dark:bg-slate-700",
                      )}
                    >
                      {/* Next power to be used by current player */}
                      <span className="w-full min-h-5 truncate">{renderNextPowerBarItemText(nextPowerBarItem)}</span>
                      {/* Power used by other players */}
                      <span
                        className="w-full min-h-5 text-gray-700 truncate"
                        style={{ opacity: usedPowerItemTextOpacity }}
                      >
                        {renderUsedPowerItemText(usedPowerItem)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat and users list */}
            <div className="[grid-area:chat] flex gap-2">
              <div
                className={clsx(
                  "overflow-hidden flex-1 flex flex-col gap-1 border border-gray-200 bg-white",
                  "dark:border-dark-game-content-border dark:bg-dark-game-chat-background",
                )}
              >
                <ServerMessage roomId={roomId} tableId={tableId} />

                {/* Chat */}
                <div className="overflow-hidden flex flex-col gap-1 h-full px-2">
                  <Chat
                    chat={table?.chat}
                    messageInputRef={messageInputRef}
                    isMessageInputDisabled={!isConnected}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              </div>

              <div className="w-[385px]">
                <PlayersList users={table?.users} isRatingsVisible={room?.level !== RoomLevel.SOCIAL} />
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
