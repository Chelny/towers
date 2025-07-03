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

  const { socket } = useSocket()
  const { removeJoinedTable, addNotification, setActiveRoomId, activeTableId, setActiveTableId } = useGame()

  useEffect(() => {
    setActiveRoomId(roomId)
    setActiveTableId(tableId)
  }, [roomId, tableId, setActiveRoomId, setActiveTableId])

  useEffect(() => {
    if (!socket) return

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

    socket.on(SocketEvents.INSTANT_MESSAGE_RECEIVED, handleInstantMessage)
    socket.on(SocketEvents.TABLE_INVITATION_NOTIFICATION, handleInvitation)
    socket.on(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleInvitationDeclined)
    socket.on(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, handleUserBooted)

    return () => {
      socket.off(SocketEvents.INSTANT_MESSAGE_RECEIVED, handleInstantMessage)
      socket.off(SocketEvents.TABLE_INVITATION_NOTIFICATION, handleInvitation)
      socket.off(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleInvitationDeclined)
      socket.off(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, handleUserBooted)
    }
  }, [socket, activeTableId])

  return <>{tableId ? <Table key={tableId} /> : <Room key={roomId} />}</>
}
