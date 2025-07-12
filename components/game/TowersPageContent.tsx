"use client"

import { ReactNode, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useGame } from "@/context/GameContext"
import { useSocket } from "@/context/SocketContext"
import { InstantMessagePlainObject } from "@/server/towers/classes/InstantMessage"
import { DeclinedTableInvitationPlainObject, TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation"

const Room = dynamic(() => import("@/components/game/Room"))
const Table = dynamic(() => import("@/components/game/Table"))

export default function TowersPageContent(): ReactNode {
  const router = useRouter()
  const searchParams = useSearchParams()

  const roomId: string | null = searchParams.get("room")
  const tableId: string | null = searchParams.get("table")

  if (!roomId) {
    throw new Error("Room ID is required")
  }

  const { socketRef } = useSocket()
  const { removeJoinedTable, addNotification, setActiveRoomId, activeTableId, setActiveTableId } = useGame()

  useEffect(() => {
    setActiveRoomId(roomId)
    setActiveTableId(tableId)
  }, [roomId, tableId, setActiveRoomId, setActiveTableId])

  useEffect(() => {
    const handleInstantMessage = (instantMessage: InstantMessagePlainObject) => {
      addNotification({ ...instantMessage, type: "instantMessage" })
    }

    const handleInvitation = (tableInvitation: TableInvitationPlainObject): void => {
      addNotification({ ...tableInvitation, type: "tableInvitation" })
    }

    const handleInvitationDeclined = (tableInvitation: DeclinedTableInvitationPlainObject): void => {
      addNotification({ ...tableInvitation, type: "tableInvitation" })
    }

    const handleUserBooted = ({
      id,
      roomId,
      tableId,
      tableNumber,
      hostUsername,
    }: {
      id: string
      roomId: string
      tableId: string
      tableNumber: number
      hostUsername: string
    }): void => {
      addNotification({
        id,
        roomId,
        tableId,
        tableNumber,
        hostUsername,
        type: "tableBootedMessage",
      })

      removeJoinedTable(tableId)

      if (activeTableId === tableId) {
        setActiveTableId(null)
        router.push(`${ROUTE_TOWERS.PATH}?room=${roomId}`)
      }
    }

    socketRef.current?.on(SocketEvents.INSTANT_MESSAGE_RECEIVED, handleInstantMessage)
    socketRef.current?.on(SocketEvents.TABLE_INVITATION_NOTIFICATION, handleInvitation)
    socketRef.current?.on(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleInvitationDeclined)
    socketRef.current?.on(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, handleUserBooted)

    return () => {
      socketRef.current?.off(SocketEvents.INSTANT_MESSAGE_RECEIVED, handleInstantMessage)
      socketRef.current?.off(SocketEvents.TABLE_INVITATION_NOTIFICATION, handleInvitation)
      socketRef.current?.off(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleInvitationDeclined)
      socketRef.current?.off(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, handleUserBooted)
    }
  }, [activeTableId])

  return <>{tableId ? <Table key={tableId} /> : <Room key={roomId} />}</>
}
