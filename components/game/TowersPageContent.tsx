"use client"

import { ReactNode, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useLingui } from "@lingui/react/macro"
import { ROUTE_TOWERS } from "@/constants/routes"
import { SocketEvents } from "@/constants/socket-events"
import { useGame } from "@/context/GameContext"
import { useSocket } from "@/context/SocketContext"
import { useToast } from "@/context/ToastContext"
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
  const { i18n, t } = useLingui()
  const { removeJoinedTable, addNotification, setActiveRoomId, activeTableId, setActiveTableId } = useGame()
  const { showToast } = useToast()

  useEffect(() => {
    setActiveRoomId(roomId)
    setActiveTableId(tableId)
  }, [roomId, tableId, setActiveRoomId, setActiveTableId])

  useEffect(() => {
    const handlePingReceived = ({ fromUsername }: { fromUsername: string }): void => {
      showToast({
        message: t({ message: `${fromUsername} has pinged you!` }),
      })
    }

    const handleInstantMessage = (instantMessage: InstantMessagePlainObject): void => {
      addNotification({ ...instantMessage, type: "instantMessage" })
    }

    const handleInvitation = (tableInvitation: TableInvitationPlainObject): void => {
      addNotification({ ...tableInvitation, type: "tableInvitation" })
    }

    const handleInvitationDeclined = (tableInvitation: DeclinedTableInvitationPlainObject): void => {
      showToast({
        message: tableInvitation.declinedReason
          ? i18n._("{username} declined your invitation. Reason: {reason}", {
              username: tableInvitation.inviteeUsername,
              reason: tableInvitation.declinedReason,
            })
          : i18n._("{username} declined your invitation.", {
              username: tableInvitation.inviteeUsername,
            }),
        duration: 10_000,
      })
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

    socketRef.current?.on(SocketEvents.USER_PING_RECEIVED, handlePingReceived)
    socketRef.current?.on(SocketEvents.INSTANT_MESSAGE_RECEIVED, handleInstantMessage)
    socketRef.current?.on(SocketEvents.TABLE_INVITATION_NOTIFICATION, handleInvitation)
    socketRef.current?.on(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleInvitationDeclined)
    socketRef.current?.on(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, handleUserBooted)

    return () => {
      socketRef.current?.off(SocketEvents.USER_PING_RECEIVED, handlePingReceived)
      socketRef.current?.off(SocketEvents.INSTANT_MESSAGE_RECEIVED, handleInstantMessage)
      socketRef.current?.off(SocketEvents.TABLE_INVITATION_NOTIFICATION, handleInvitation)
      socketRef.current?.off(SocketEvents.TABLE_INVITATION_DECLINED_NOTIFICATION, handleInvitationDeclined)
      socketRef.current?.off(SocketEvents.TABLE_BOOTED_USER_NOTIFICATION, handleUserBooted)
    }
  }, [activeTableId])

  return <>{tableId ? <Table key={tableId} /> : <Room key={roomId} />}</>
}
