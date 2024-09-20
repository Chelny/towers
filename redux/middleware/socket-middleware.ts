import { Middleware, MiddlewareAPI } from "redux"
import { SocketFactory, SocketInterface } from "@/lib"
import {
  beforeLeaveSocketRoom,
  connectionEstablished,
  connectionLost,
  destroySocket,
  initSocket,
  joinSocketRoom,
  sendMessageToRoomChat,
  sendMessageToTableChat,
  setRoomChatMessage,
  setTableChatMessage
} from "@/redux/features"

enum SocketEvent {
  Connect = "connect",
  ConnectError = "connect_error",
  Reconnect = "reconnect",
  ReconnectError = "reconnect_error",
  ReconnectFailed = "reconnect_failed",
  Disconnect = "disconnect",
  // Emit events
  JoinRoom = "room:join",
  LeaveRoom = "room:leave",
  JoinTable = "table:join",
  LeaveTable = "table:leave",
  SendRoomMessage = "room:send-message",
  SendTableMessage = "table:send-message",
  // On events
  SetRoomChatMessage = "room:set-message",
  SetTableChatMessage = "table:set-message",
  SendUserJoinedTableMessage = "table:send-user-joined-message",
  SendUserLeftTableMessage = "table:send-user-left-message",
  SignOut = "user:sign-out",
  SignOutSuccess = "user:sign-out-success",
  Error = "err",
}

const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
  let socket: SocketInterface

  return (next) => async (action: unknown) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== "undefined") {
        socket = await SocketFactory.create()

        socket.socket.on(SocketEvent.Connect, () => {
          store.dispatch(connectionEstablished())
          console.info(`User connected with socket ID: ${socket.socket.id}.`)
        })

        socket.socket.on(SocketEvent.ConnectError, (error: Error) => {
          console.error(`Connection error: ${error.message}.`)
        })

        socket.socket.on(SocketEvent.Reconnect, (attemptNumber: number) => {
          console.info(`Reconnected successfully after ${attemptNumber} attempts.`)
        })

        socket.socket.on(SocketEvent.ReconnectError, (error: Error) => {
          console.error(`Reconnection error: ${error.message}`)
        })

        socket.socket.on(SocketEvent.ReconnectFailed, () => {
          console.error("Reconnection failed.")
        })

        socket.socket.on(SocketEvent.Disconnect, (reason: string) => {
          store.dispatch(connectionLost())
          console.info(`Socket disconnected due to ${reason}.`)
        })

        socket.socket.on(SocketEvent.Error, (message: string) => {
          console.error(message)
        })

        socket.socket.on(SocketEvent.SetRoomChatMessage, async ({ roomId, data }) => {
          store.dispatch(setRoomChatMessage({ roomId, data }))
        })

        socket.socket.on(SocketEvent.SetTableChatMessage, async ({ tableId, data }) => {
          store.dispatch(setTableChatMessage({ tableId, data }))
        })

        socket.socket.on(SocketEvent.SendUserJoinedTableMessage, async ({ tableId, data }) => {
          store.dispatch(setTableChatMessage({ tableId, data }))
        })

        socket.socket.on(SocketEvent.SendUserLeftTableMessage, async ({ tableId, data }) => {
          store.dispatch(setTableChatMessage({ tableId, data }))
        })

        socket.socket.on(SocketEvent.SignOutSuccess, () => {
          SocketFactory.destroy()
        })
      }
    }

    if (socket) {
      if (joinSocketRoom.match(action)) {
        const { room, isTable, username } = action.payload
        socket.socket.emit(isTable ? SocketEvent.JoinTable : SocketEvent.JoinRoom, { room, username })
      }

      if (beforeLeaveSocketRoom.match(action)) {
        const { room, isTable, username } = action.payload
        socket.socket.emit(isTable ? SocketEvent.LeaveTable : SocketEvent.LeaveRoom, { room, username })
      }

      if (sendMessageToRoomChat.match(action)) {
        const { roomId, towersUserId, message } = action.payload
        socket.socket.emit(SocketEvent.SendRoomMessage, { roomId, towersUserId, message })
      }

      if (sendMessageToTableChat.match(action)) {
        const { tableId, towersUserId, message } = action.payload
        socket.socket.emit(SocketEvent.SendTableMessage, { tableId, towersUserId, message })
      }

      if (destroySocket.match(action)) {
        socket.socket.emit(SocketEvent.SignOut)
      }
    }

    next(action)
  }
}

export default socketMiddleware
