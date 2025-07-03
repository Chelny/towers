"use client"

import { ReactNode, useEffect, useState } from "react"
import { Trans } from "@lingui/react/macro"
import AlertMessage from "@/components/ui/AlertMessage"
import { useSocket } from "@/context/SocketContext"
import { authClient } from "@/lib/auth-client"

type ServerMessageProps = {
  roomId: string
  tableId?: string
}

export default function ServerMessage({ roomId, tableId }: ServerMessageProps): ReactNode {
  const { data: session, isPending } = authClient.useSession()
  const { isConnected } = useSocket()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const username: string | undefined = session?.user.username

  useEffect(() => {
    if (!isPending) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        setIsInitialized(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [session])

  if (!isInitialized) {
    return <AlertMessage>&nbsp;</AlertMessage>
  }

  if (isConnected) {
    if (!isPending && !session) {
      return (
        <AlertMessage type="error">
          <Trans>You are not logged in</Trans>
        </AlertMessage>
      )
    }

    if (!isPending && session) {
      return (
        <AlertMessage type="info">
          <Trans>Connected to the game as {username}</Trans>
        </AlertMessage>
      )
    }
  } else {
    return (
      <AlertMessage type="error">
        <Trans>Disconnected from server</Trans>
      </AlertMessage>
    )
  }

  return null
}
