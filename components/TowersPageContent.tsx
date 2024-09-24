"use client"

import { ReactNode, useEffect } from "react"
import Room from "@/components/Room"
import Table from "@/components/Table"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { destroySocket, initSocket } from "@/redux/features/socket-slice"
import { AppDispatch, RootState } from "@/redux/store"

type TowersPageContentProps = {
  roomId: string
  tableId: string
}

export default function TowersPageContent({ roomId, tableId }: TowersPageContentProps): ReactNode {
  const { status, update } = useSessionData()
  const isConnected: boolean = useAppSelector((state: RootState) => state.socket.isConnected)
  const dispatch: AppDispatch = useAppDispatch()

  // Polling the session every 1 hour
  useEffect(() => {
    const handleOnline = (): void => {
      console.info("You are online.")
      update()
      connectToSocket()
    }

    const handleOffline = (): void => {
      console.info("You are offline.")
      dispatch(destroySocket())
    }

    const updateSession = (): void => {
      if (navigator.onLine) {
        update()
      }
    }

    const interval: NodeJS.Timeout = setInterval(updateSession, 1000 * 60 * 60)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [update, status, isConnected])

  /**
   * Listen for when the page is visible, if the user switches tabs
   * and makes our tab visible again, re-fetch the session
   */
  useEffect(() => {
    const handleVisibility = (): void => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        update()
      }
    }

    window.addEventListener("visibilitychange", handleVisibility, false)

    return () => window.removeEventListener("visibilitychange", handleVisibility, false)
  }, [update])

  useEffect(() => {
    connectToSocket()
  }, [status, isConnected])

  const connectToSocket = (): void => {
    if (status === "authenticated") {
      if (!isConnected) {
        dispatch(initSocket())
      }
    }
  }

  return <>{tableId ? <Table roomId={roomId} tableId={tableId} /> : <Room roomId={roomId} />}</>
}
