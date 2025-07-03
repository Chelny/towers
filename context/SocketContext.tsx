"use client"

import { Context, createContext, PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import { authClient } from "@/lib/auth-client"
import { logger } from "@/lib/logger"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

export const SocketContext: Context<SocketContextType> = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const SocketProvider = ({ children }: PropsWithChildren): ReactNode => {
  const { data: session, isPending } = authClient.useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    const newSocket: Socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 10000,
      reconnectionDelayMax: 10000,
      withCredentials: true,
    })

    setSocket(newSocket)

    const handleConnect = (): void => {
      setIsConnected(true)
    }

    const handleDisconnect = (): void => {
      setIsConnected(false)
    }

    newSocket.on("connect", handleConnect)
    newSocket.on("disconnect", handleDisconnect)

    return () => {
      newSocket.off("connect", handleConnect)
      newSocket.off("disconnect", handleDisconnect)
      newSocket.disconnect()
      setSocket(null)
    }
  }, [])

  useEffect(() => {
    if (isPending || !socket) return

    if (session) {
      socket.auth = { session }
      socket.connect()
    } else {
      socket.disconnect()
    }
  }, [isPending, socket, session])

  useEffect(() => {
    if (!isPending && !session && socket) {
      // TODO: Show a modal or redirect
      logger.warn("No session found. Disconnecting socket and prompting user to re-auth.")
      socket.disconnect()
    }
  }, [isPending, session, socket])

  useEffect(() => {
    if (!socket) return

    const handleOnline = (): void => {
      logger.info("You are online. Reconnecting socket...")
      socket.connect()
    }

    const handleOffline = (): void => {
      logger.warn("You are offline. Disconnecting socket...")
      socket.disconnect()
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [socket])

  useEffect(() => {
    if (!socket) return

    // **************************************************
    // * Socket IO Events
    // **************************************************

    socket.on("connect", () => {
      logger.info(`Socket connected. Socket ID: ${socket.id}.`)
    })

    socket.on("connect_error", (error: Error) => {
      logger.error(`Socket connection error: ${error.message}.`)
    })

    socket.on("ping", () => {
      logger.info("Ping event received.")
    })

    socket.on("reconnect", (attempt: number) => {
      logger.info(`Reconnected to the socket successfully after ${attempt} attempts.`)
    })

    socket.on("reconnect_attempt", (attempt: number) => {
      logger.info(`Attempting to reconnect to the socket... Attempt number: ${attempt}.`)

      // Re-attach the session on every reconnect attempt
      socket.auth = { session }
    })

    socket.on("reconnect_error", (error: Error) => {
      logger.error(`Socket reconnection error: ${error.message}.`)
    })

    socket.on("reconnect_failed", () => {
      logger.error("Socket reconnection failed.")
    })

    socket.on("disconnect", (reason: string) => {
      logger.info(`Socket disconnected due to ${reason}.`)
    })

    socket.on("error", (error: Error) => {
      logger.error(`Socket error: ${error.message}.`)
    })

    socket.on("socket:disconnect:success", () => {
      socket.disconnect()
      setSocket(null)
    })

    // **************************************************
    // * Server.js Error Events
    // **************************************************

    socket.on("server:error", (message: string) => {
      logger.error(`Server error: ${message}.`)
    })

    return () => {
      socket.off("connect")
      socket.off("connect_error")
      socket.off("ping")
      socket.off("reconnect")
      socket.off("reconnect_attempt")
      socket.off("reconnect_error")
      socket.off("reconnect_failed")
      socket.off("disconnect")
      socket.off("error")
      socket.off("socket:disconnect:success")
      socket.off("server:error")
    }
  }, [socket])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}

export const useSocket = (): SocketContextType => {
  const context: SocketContextType = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
