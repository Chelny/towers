"use client"

import { ReactNode, useEffect, useState } from "react"
import { Trans } from "@lingui/react/macro"
import AlertMessage from "@/components/ui/AlertMessage"
import { authClient } from "@/lib/auth-client"
import { useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

type ServerMessageProps = {
  roomId: string
  tableId?: string
}

export default function ServerMessage({ roomId, tableId }: ServerMessageProps): ReactNode {
  const { data: session, isPending } = authClient.useSession()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const errorMessage: string | null = useAppSelector((state: RootState) => {
    if (state.socket.errorMessage) {
      return state.socket.errorMessage
    } else {
      if (roomId && tableId) {
        return state.socket.towers.tables?.[tableId]?.errorMessage
      }

      return state.socket.towers.rooms[roomId]?.errorMessage
    }
  })
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
    if (errorMessage) {
      return <AlertMessage type="error">{errorMessage}</AlertMessage>
    }

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
