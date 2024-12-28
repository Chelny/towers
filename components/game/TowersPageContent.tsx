"use client"

import { ReactNode, useEffect } from "react"
import Room from "@/components/game/Room"
import Table from "@/components/game/Table"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { destroySocket, initSocket } from "@/redux/features/socket-slice"
import { AppDispatch, RootState } from "@/redux/store"

type TowersPageContentProps = {
  roomId: string
  tableId: string
}

export default function TowersPageContent({ roomId, tableId }: TowersPageContentProps): ReactNode {
  const { data: session } = authClient.useSession()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const dispatch: AppDispatch = useAppDispatch()

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

  const connectToSocket = (): void => {
    if (session && !isConnected) {
      dispatch(initSocket({ session }))
    }
  }

  return <>{tableId ? <Table roomId={roomId} tableId={tableId} /> : <Room roomId={roomId} />}</>
}
