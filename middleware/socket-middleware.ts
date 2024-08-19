import { TableChatMessageType } from "@prisma/client"
import { Middleware, MiddlewareAPI } from "redux"
import {
  connectionEstablished,
  connectionLost,
  // createTable,
  // deleteTable,
  destroySocket,
  getRoomChatMessage,
  getTableChatMessage,
  // getTables,
  initSocket,
  joinRoom,
  leaveRoom,
  sendMessageToRoomChat,
  sendMessageToTableChat
} from "@/features"
import { SocketFactory, SocketInterface } from "@/lib"

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
  UserJoinedTableAnnouncement = "table:user-joined-announcement",
  LeaveTable = "table:leave",
  UserLeaveTableAnnouncement = "table:user-left-announcement",
  CreateTable = "create-table",
  DeleteTable = "delete-table",
  GetTables = "get-tables",
  SendToRoomChat = "send-message-to-room-chat",
  GetRoomChatMessage = "get-room-chat-message",
  SendToTableChat = "send-message-to-table-chat",
  GetTableChatMessage = "get-table-chat-message",
  SignOut = "sign-out",
  SignOutSuccess = "sign-out-success",
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

        // socket.socket.on(SocketEvent.GetTables, ({ room }) => {
        //   console.log("GetTables", room)
        //   store.dispatch(getTables({ room }))
        // })

        socket.socket.on(SocketEvent.GetRoomChatMessage, async ({ roomId, towersUserId, message }) => {
          const response: Response = await fetch("/api/room-chat", {
            method: "POST",
            body: JSON.stringify({ roomId, towersUserId, message })
          })

          if (response.ok) {
            const data = await response.json()
            store.dispatch(getRoomChatMessage(data.data))
          }
        })

        socket.socket.on(SocketEvent.UserJoinedTableAnnouncement, async ({ tableId, username }) => {
          const message: string = `*** ${username} joined the table.`
          // TODO: Uncomment
          // const response: Response = await fetch("/api/table-chat", {
          //   method: "POST",
          //   body: JSON.stringify({ tableId, message, type: TableChatMessageType.USER_ACTION })
          // })

          // if (response.ok) {
          //   const data = await response.json()
          //   store.dispatch(getTableChatMessage(data.data))
          // }
        })

        socket.socket.on(SocketEvent.UserLeaveTableAnnouncement, async ({ tableId, username }) => {
          const message: string = `*** ${username} left the table.`
          // TODO: Uncomment
          // const response: Response = await fetch("/api/table-chat", {
          //   method: "POST",
          //   body: JSON.stringify({ tableId, message, type: TableChatMessageType.USER_ACTION })
          // })

          // if (response.ok) {
          //   const data = await response.json()
          //   store.dispatch(getTableChatMessage(data.data))
          // }
        })

        socket.socket.on(SocketEvent.GetTableChatMessage, async ({ tableId, towersUserId, message }) => {
          const response: Response = await fetch("/api/table-chat", {
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
      if (joinRoom.match(action)) {
        const { room, isTable, username } = action.payload
        socket.socket.emit(isTable ? SocketEvent.JoinTable : SocketEvent.JoinRoom, { room, username })
      }

      if (leaveRoom.match(action)) {
        const { room, isTable, username } = action.payload
        socket.socket.emit(isTable ? SocketEvent.LeaveTable : SocketEvent.LeaveRoom, { room, username })
      }

      // if (createTable.match(action)) {
      //   const { room, tableId, roomId, hostId, tableType, rated } = action.payload
      //   socket.socket.emit(SocketEvent.CreateTable, { room, tableId, roomId, hostId, tableType, rated })
      // }

      // if (deleteTable.match(action)) {
      //   const { room, tableId } = action.payload
      //   socket.socket.emit(SocketEvent.DeleteTable, { room, tableId })
      // }

      if (sendMessageToRoomChat.match(action)) {
        const { roomId, towersUserId, message } = action.payload
        socket.socket.emit(SocketEvent.SendToRoomChat, { roomId, towersUserId, message })
      }

      if (sendMessageToTableChat.match(action)) {
        const { tableId, towersUserId, message } = action.payload
        socket.socket.emit(SocketEvent.SendToTableChat, { tableId, towersUserId, message })
      }

      if (destroySocket.match(action)) {
        socket.socket.emit(SocketEvent.SignOut)
      }
    }

    next(action)
  }
}

export default socketMiddleware
