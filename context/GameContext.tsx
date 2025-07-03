"use client"

import { Context, createContext, PropsWithChildren, ReactNode, useCallback, useContext, useState } from "react"
import { InstantMessagePlainObject } from "@/server/towers/classes/InstantMessage"
import { DeclinedTableInvitationPlainObject, TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation"

export type GameRoomSummary = {
  id: string
  name: string
  basePath: string
}

export type GameTableSummary = {
  id: string
  tableNumber: number
  roomId: string
  roomName: string
}

export type NotificationStatus = "read" | "unread"

export type GameInstantMessage = InstantMessagePlainObject & {
  status?: NotificationStatus
}

export type GameTableInvitation = (TableInvitationPlainObject | DeclinedTableInvitationPlainObject) & {
  status?: NotificationStatus
}

export type GameTableBootedMessage = {
  id: string
  roomId: string
  tableId: string
  tableNumber: number
  hostUsername: string
  status?: NotificationStatus
}

export type GameNotification =
  | ({ type: "instantMessage" } & GameInstantMessage)
  | ({ type: "tableInvitation" } & GameTableInvitation)
  | ({ type: "tableBootedMessage" } & GameTableBootedMessage)

type GameContextType = {
  joinedRooms: GameRoomSummary[]
  addJoinedRoom: (room: GameRoomSummary) => void
  removeJoinedRoom: (roomId: string) => void

  joinedTables: GameTableSummary[]
  addJoinedTable: (table: GameTableSummary) => void
  removeJoinedTable: (tableId: string) => void

  notifications: Record<string, GameNotification[]>
  addNotification: (notification: GameNotification) => void
  removeNotification: (roomId: string, notificationId: string) => void
  markNotificationRead: (roomId: string, notificationId: string) => void

  activeRoomId: string | null
  setActiveRoomId: (id: string | null) => void

  activeTableId: string | null
  setActiveTableId: (id: string | null) => void
}

const GameContext: Context<GameContextType | undefined> = createContext<GameContextType | undefined>(undefined)

export const GameProvider = ({ children }: PropsWithChildren): ReactNode => {
  const [joinedRooms, setJoinedRooms] = useState<GameRoomSummary[]>([])
  const [joinedTables, setJoinedTables] = useState<GameTableSummary[]>([])
  const [notifications, setNotifications] = useState<Record<string, GameNotification[]>>({})
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [activeTableId, setActiveTableId] = useState<string | null>(null)

  /**************************************************
   * Room
   **************************************************/

  const addJoinedRoom = useCallback((room: GameRoomSummary) => {
    setJoinedRooms((prev: GameRoomSummary[]) => {
      if (prev.find((r: GameRoomSummary) => r.id === room.id)) return prev
      return [...prev, room]
    })
  }, [])

  const removeJoinedRoom = useCallback((roomId: string) => {
    setJoinedRooms((prev: GameRoomSummary[]) => prev.filter((r: GameRoomSummary) => r.id !== roomId))
    setJoinedTables((prev: GameTableSummary[]) => prev.filter((t: GameTableSummary) => t.roomId !== roomId))
    setNotifications((prev: Record<string, GameNotification[]>) => {
      const copy: { [x: string]: GameNotification[] } = { ...prev }
      delete copy[roomId]
      return copy
    })
  }, [])

  /**************************************************
   * Table
   **************************************************/

  const addJoinedTable = useCallback((table: GameTableSummary) => {
    setJoinedTables((prev: GameTableSummary[]) => {
      if (prev.find((t: GameTableSummary) => t.id === table.id)) return prev
      return [...prev, table]
    })
  }, [])

  const removeJoinedTable = useCallback((tableId: string) => {
    setJoinedTables((prev: GameTableSummary[]) => prev.filter((t: GameTableSummary) => t.id !== tableId))
  }, [])

  /**************************************************
   * Notifications
   **************************************************/

  const addNotification = useCallback((notification: GameNotification) => {
    setNotifications((prev: Record<string, GameNotification[]>) => {
      const list: GameNotification[] = prev[notification.roomId] ?? []

      if (list.some((n: GameNotification) => n.id === notification.id)) return prev

      const newNotification: GameNotification = {
        ...notification,
        status: notification.status ?? "unread",
      }

      return {
        ...prev,
        [newNotification.roomId]: [...list, newNotification],
      }
    })
  }, [])

  const removeNotification = useCallback((roomId: string, notificationId: string) => {
    setNotifications((prev: Record<string, GameNotification[]>) => {
      const list: GameNotification[] = prev[roomId] ?? []
      return {
        ...prev,
        [roomId]: list.filter((notification: GameNotification) => notification.id !== notificationId),
      }
    })
  }, [])

  const markNotificationRead = useCallback((roomId: string, notificationId: string) => {
    setNotifications((prev: Record<string, GameNotification[]>) => {
      const list: GameNotification[] = prev[roomId] ?? []
      return {
        ...prev,
        [roomId]: list.map((n: GameNotification) => (n.id === notificationId ? { ...n, status: "read" } : n)),
      }
    })
  }, [])

  /**************************************************
   * Values
   **************************************************/

  const value: GameContextType = {
    joinedRooms,
    addJoinedRoom,
    removeJoinedRoom,

    joinedTables,
    addJoinedTable,
    removeJoinedTable,

    notifications,
    addNotification,
    removeNotification,
    markNotificationRead,

    activeRoomId,
    setActiveRoomId,

    activeTableId,
    setActiveTableId,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export const useGame = (): GameContextType => {
  const context: GameContextType | undefined = useContext(GameContext)
  if (!context) throw new Error("useGameContext must be used within a GameProvider")
  return context
}
