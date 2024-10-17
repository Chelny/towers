"use client"

import { ReactNode, useEffect, useState } from "react"
import AlertMessage from "@/components/ui/AlertMessage"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppSelector } from "@/lib/hooks"
import { RootState } from "@/redux/store"

type ServerMessageProps = {
  socketRoom: string
}

export default function ServerMessage({ socketRoom }: ServerMessageProps): ReactNode {
  const { data: session, status } = useSessionData()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const errorMessage: string | undefined = useAppSelector(
    (state: RootState) =>
      state.socket.errorMessage ??
      (socketRoom && (state.socket.rooms[socketRoom]?.errorMessage ?? state.socket.tables[socketRoom]?.errorMessage))
  )
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  useEffect(() => {
    if (status !== "loading") {
      const timer: NodeJS.Timeout = setTimeout(() => {
        setIsInitialized(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [status])

  if (!isInitialized) {
    return null
  }

  if (isConnected) {
    if (errorMessage) {
      return <AlertMessage type="error">{errorMessage}</AlertMessage>
    }

    if (status === "unauthenticated") {
      return <AlertMessage type="error">You are not logged in</AlertMessage>
    }

    if (status === "authenticated") {
      return <AlertMessage type="info">Connected to the game as {session?.user.username}</AlertMessage>
    }
  } else {
    return <AlertMessage type="error">Disconnected from server</AlertMessage>
  }

  return null
}
