"use client"

import { ReactNode, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Room from "@/components/game/Room"
import Table from "@/components/game/Table"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { destroySocket, initSocket } from "@/redux/features/socket-slice"
import { AppDispatch, RootState } from "@/redux/store"

export default function TowersPageContent(): ReactNode {
  const searchParams = useSearchParams()
  const dispatch: AppDispatch = useAppDispatch()

  const roomId: string | null = searchParams.get("room")
  const tableId: string | null = searchParams.get("table")

  if (!roomId) {
    throw new Error("Room ID is required")
  }

  const { data: session } = authClient.useSession()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)

  const connectToSocket = (): void => {
    if (session && !isConnected) {
      dispatch(initSocket({ session }))
    }
  }

  useEffect(() => {
    const handleOnline = (): void => {
      console.info("You are online.")
      connectToSocket()
    }

    const handleOffline = (): void => {
      console.info("You are offline.")
      dispatch(destroySocket())
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [session, isConnected])

  useEffect(() => {
    connectToSocket()
  }, [session, isConnected])

  return <>{tableId ? <Table /> : <Room />}</>
}
