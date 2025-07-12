"use client"

import {
  Context,
  createContext,
  createRef,
  PropsWithChildren,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { io, Socket } from "socket.io-client"
import { Session } from "@/lib/auth-client"
import { logger } from "@/lib/logger"

interface SocketContextType {
  socketRef: RefObject<Socket | null>
  isConnected: boolean
  session: Session | null
}

export const SocketContext: Context<SocketContextType> = createContext<SocketContextType>({
  socketRef: createRef<Socket>(),
  isConnected: false,
  session: null,
})

export const SocketProvider = ({ children, session }: PropsWithChildren<{ session: Session | null }>): ReactNode => {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    if (!session) {
      if (socketRef.current) {
        // TODO: Show a modal or redirect user to sign in page
        logger.warn("No session found. Disconnecting socket and prompting user to re-auth.")
        socketRef.current.disconnect()
        socketRef.current = null
      }

      return
    }

    if (socketRef.current) {
      logger.info("Socket already exists. No new connection.")
      return
    }

    // Session is ready, socket will be created
    const socket: Socket = io({
      auth: { session },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 10000,
      reconnectionDelayMax: 10000,
      withCredentials: true,
    })

    socketRef.current = socket

    // **************************************************
    // * Socket IO Events
    // **************************************************

    socket.on("connect", () => {
      setIsConnected(true)
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
      setIsConnected(false)
      logger.info(`Socket disconnected due to ${reason}.`)
    })

    socket.on("error", (error: Error) => {
      logger.error(`Socket error: ${error.message}.`)
    })

    socket.on("socket:disconnect:success", () => {
      socket.disconnect()
      socketRef.current = null
    })

    // **************************************************
    // * Server.js Error Events
    // **************************************************

    socket.on("server:error", (message: string) => {
      logger.error(`Server error: ${message}.`)
    })

    // **************************************************
    // * Network Events
    // **************************************************

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

    // **************************************************
    // * Cleanups
    // **************************************************

    return () => {
      socketRef.current = null

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
      socket.disconnect()

      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [session])

  return <SocketContext.Provider value={{ socketRef, isConnected, session }}>{children}</SocketContext.Provider>
}

export const useSocket = (): SocketContextType => {
  const context: SocketContextType = useContext(SocketContext)
  if (!context) throw new Error("useSocket must be used within a SocketProvider")
  return context
}
