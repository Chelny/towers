/* eslint-disable no-unused-vars */
import { Middleware, MiddlewareAPI } from "redux"
import { SocketFactory, SocketInterface } from "@/lib/socket-factory"
import {
  beforeLeaveSocketRoom,
  connectionEstablished,
  connectionLost,
  destroySocket,
  initSocket,
  joinSocketRoom,
  sendMessageToRoomChat,
  sendMessageToTableChat,
  serverError,
  setRoomChatMessage,
  setTableChatMessage
} from "@/redux/features/socket-slice"

enum SocketEvent {
  Connect = "connect",
  ConnectError = "connect_error",
  Disconnect = "disconnect",
  Reconnect = "reconnect",
  ReconnectAttempt = "reconnect_attempt",
  ReconnectError = "reconnect_error",
  ReconnectFailed = "reconnect_failed",
  Error = "error",
  // Emit events
  JoinRoom = "room:join",
  LeaveRoom = "room:leave",
  JoinTable = "table:join",
  LeaveTable = "table:leave",
  LeaveMultipleTables = "table:leave-multiple",
  SendRoomMessage = "room:send-message",
  SendTableMessage = "table:send-message",
  // On events
  SetRoomChatMessage = "room:set-message",
  SetRoomErrorMessage = "room:error",
  SetTableChatMessage = "table:set-message",
  SendUserJoinedTableMessage = "table:send-user-joined-message",
  SendUserLeftTableMessage = "table:send-user-left-message",
  SetTableErrorMessage = "table:error",
  SignOut = "user:sign-out",
  SignOutSuccess = "user:sign-out-success",
  ServerError = "err",
}

const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
  let socket: SocketInterface

  return (next) => async (action: unknown) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== "undefined") {
        socket = await SocketFactory.create()

        socket.socket.on(SocketEvent.Connect, (): void => {
          store.dispatch(connectionEstablished())
          console.info(`User connected with socket ID: ${socket.socket.id}.`)
        })

        socket.socket.on(SocketEvent.ConnectError, (error: Error): void => {
          console.error(`Connection error: ${error.message}.`)
          store.dispatch(connectionLost(error.message))
        })

        socket.socket.on(SocketEvent.Disconnect, (reason: string): void => {
          store.dispatch(connectionLost())
          console.info(`Socket disconnected due to ${reason}.`)
        })

        socket.socket.on(SocketEvent.Reconnect, (attempt: number): void => {
          store.dispatch(connectionEstablished())
          console.info(`Reconnected successfully after ${attempt} attempts.`)
        })

        socket.socket.on(SocketEvent.ReconnectAttempt, (attempt: number): void => {
          console.info(`Attempting to reconnect to the socket... Attempt number: ${attempt}`)
        })

        socket.socket.on(SocketEvent.ReconnectError, (error: Error): void => {
          console.error(`Reconnection error: ${error.message}`)
          store.dispatch(connectionLost(error.message))
        })

        socket.socket.on(SocketEvent.ReconnectFailed, (): void => {
          console.error("Reconnection failed.")
          store.dispatch(connectionLost("Reconnection failed."))
        })

        socket.socket.on(SocketEvent.Error, (error: Error): void => {
          console.error(`Socket error: ${error.message}.`)
        })

        socket.socket.on(SocketEvent.ServerError, (message: string): void => {
          console.error(`Server error: ${message}.`)
          store.dispatch(serverError(message))
        })

        socket.socket.on(SocketEvent.LeaveMultipleTables, ({ roomId, tableId, username }): void => {
          store.dispatch(beforeLeaveSocketRoom({ roomId, tableId, username }))
        })

        socket.socket.on(SocketEvent.SetRoomChatMessage, ({ roomId, data }): void => {
          store.dispatch(setRoomChatMessage({ roomId, data }))
        })

        socket.socket.on(SocketEvent.SetTableChatMessage, ({ tableId, data }): void => {
          store.dispatch(setTableChatMessage({ tableId, data }))
        })

        socket.socket.on(SocketEvent.SendUserJoinedTableMessage, ({ tableId, data }): void => {
          store.dispatch(setTableChatMessage({ tableId, data }))
        })

        socket.socket.on(SocketEvent.SendUserLeftTableMessage, ({ tableId, data }): void => {
          store.dispatch(setTableChatMessage({ tableId, data }))
        })

        socket.socket.on(SocketEvent.SignOutSuccess, (): void => {
          SocketFactory.destroy()
        })
      }
    }

    if (socket) {
      if (joinSocketRoom.match(action)) {
        const { roomId, tableId, username } = action.payload
        socket.socket.emit(tableId ? SocketEvent.JoinTable : SocketEvent.JoinRoom, {
          room: tableId ?? roomId,
          username
        })
      }

      if (beforeLeaveSocketRoom.match(action)) {
        const { roomId, tableId, tableIds, username } = action.payload
        socket.socket.emit(tableId ? SocketEvent.LeaveTable : SocketEvent.LeaveRoom, {
          room: tableId ?? roomId,
          tableIds,
          username
        })
      }

      if (sendMessageToRoomChat.match(action)) {
        const { roomId, message } = action.payload
        socket.socket.emit(SocketEvent.SendRoomMessage, { roomId, message })
      }

      if (sendMessageToTableChat.match(action)) {
        const { tableId, message } = action.payload
        socket.socket.emit(SocketEvent.SendTableMessage, { tableId, message })
      }

      if (destroySocket.match(action)) {
        socket.socket.emit(SocketEvent.SignOut)
      }
    }

    next(action)
  }
}

export default socketMiddleware
