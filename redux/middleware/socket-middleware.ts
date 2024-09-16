import { TableChatMessageType } from "@prisma/client"
import { Middleware, MiddlewareAPI } from "redux"
import { SocketFactory, SocketInterface } from "@/lib"
import {
  beforeLeaveSocketRoom,
  connectionEstablished,
  connectionLost,
  destroySocket,
  getRoomChatMessage,
  getTableChatMessage,
  initSocket,
  joinSocketRoom,
  leaveSocketRoom,
  sendMessageToRoomChat,
  sendMessageToTableChat
} from "@/redux/features"

enum SocketEvent {
  Connect = "connect",
  ConnectError = "connect_error",
  Reconnect = "reconnect",
  ReconnectError = "reconnect_error",
  ReconnectFailed = "reconnect_failed",
  Disconnect = "disconnect",
  JoinRoom = "room:join",
  LeaveRoom = "room:leave",
  JoinTable = "table:join",
  SendUserJoinedTableMessage = "table:send-user-joined-message",
  BeforeLeaveTable = "table:before-leave",
  SendUserLeftTableMessage = "table:send-user-left-message",
  LeaveTable = "table:leave",
  SendRoomMessage = "room:send-message",
  SetRoomChatMessage = "room:set-message",
  SendTableMessage = "table:send-message",
  SetTableChatMessage = "table:set-message",
  SignOut = "user:sign-out",
  SignOutSuccess = "user:sign-out-success",
  Error = "err",
}

export const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
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

        socket.socket.on(SocketEvent.SetRoomChatMessage, async ({ roomId, towersUserId, message }) => {
          const response: Response = await fetch(`/api/rooms/${roomId}/chat`, {
            method: "POST",
            body: JSON.stringify({ roomId, towersUserId, message })
          })

          if (response.ok) {
            const data = await response.json()
            store.dispatch(getRoomChatMessage(data.data))
          }
        })

        socket.socket.on(SocketEvent.SendUserJoinedTableMessage, async ({ tableId, username }) => {
          try {
            // TODO: Uncomment for production
            // const message: string = `*** ${username} joined the table.`
            // const response: Response = await fetch(`/api/tables/${tableId}/chat`, {
            //   method: "POST",
            //   body: JSON.stringify({ tableId, message, type: TableChatMessageType.USER_ACTION })
            // })
            // if (response.ok) {
            //   const data = await response.json()
            //   store.dispatch(getTableChatMessage(data.data))
            // }
          } catch (error) {
            console.error(error)
          }
        })

        socket.socket.on(SocketEvent.SendUserLeftTableMessage, async ({ tableId, username }) => {
          try {
            // TODO: Uncomment for production
            // const message: string = `*** ${username} left the table.`
            // const response: Response = await fetch(`/api/tables/${tableId}/chat`, {
            //   method: "POST",
            //   body: JSON.stringify({ tableId, message, type: TableChatMessageType.USER_ACTION })
            // })

            // if (response.ok) {
            //   const data = await response.json()
            //   store.dispatch(getTableChatMessage(data.data))
            // }

            store.dispatch(leaveSocketRoom({ room: tableId, isTable: true, username }))
          } catch (error) {
            console.error(error)
          }
        })

        socket.socket.on(SocketEvent.SetTableChatMessage, async ({ tableId, towersUserId, message }) => {
          const response: Response = await fetch(`/api/tables/${tableId}/chat`, {
            method: "POST",
            body: JSON.stringify({ tableId, towersUserId, message })
          })

          if (response.ok) {
            const data = await response.json()
            store.dispatch(getTableChatMessage(data.data))
          }
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
        socket.socket.emit(isTable ? SocketEvent.BeforeLeaveTable : SocketEvent.LeaveRoom, { room, username })
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
