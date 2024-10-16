import { Middleware, MiddlewareAPI } from "redux"
import { SocketFactory, SocketInterface } from "@/lib/socket-factory"
import {
  addMessageToRoomChat,
  addMessageToTableChat,
  addTable,
  addTableToRoom,
  addUserToRoom,
  addUserToTable,
  beforeLeaveTableAction,
  connectionEstablished,
  connectionLost,
  destroySocket,
  initSocket,
  joinRoomAction,
  joinTableAction,
  leaveRoomAction,
  removeTable,
  removeTableFromRoom,
  removeUserFromRoom,
  removeUserFromTable,
  sendRoomChatMessage,
  sendTableAutomatedChatMessage,
  sendTableChatMessage,
  serverError,
  updateTable,
  updateTableInRoom
} from "@/redux/features/socket-slice"

export enum SocketEvent {
  // Socket IO Listeners
  Connect = "connect",
  ConnectError = "connect_error",
  Disconnect = "disconnect",
  Reconnect = "reconnect",
  ReconnectAttempt = "reconnect_attempt",
  ReconnectError = "reconnect_error",
  ReconnectFailed = "reconnect_failed",
  Error = "error",

  // Custom Listeners
  RoomReceiveChatMessage = "[room] receive new chat message",
  TableAddForAllRoomUsers = "[table] add for all room users",
  TableUpdateForAllRoomUsers = "[table] update for all room users",
  TableDeleteForAllRoomUsers = "[table] remove for all room users",
  TableReceiveChatMessage = "[table] receive new chat message",
  TableDisplayUserJoinedMessage = "[table] display user joined message",
  TableDisplayUserLeftMessage = "[table] display user left message",
  UserSignOutSuccess = "[user] sign out success",
  ServerError = "[server] error",

  // Emitters
  RoomJoin = "[room] join",
  RoomLeaveAllTables = "[room] leave all room tables",
  RoomLeave = "[room] leave",
  RoomSendMessage = "[room] send message",
  RoomUserJoined = "[room] user joined",
  RoomUserLeft = "[room] user left",
  TableJoin = "[table] join",
  TableLeave = "[table] leave",
  TableCreate = "[table] create",
  TableUpdate = "[table] update",
  TableDelete = "[table] delete",
  TableSendMessage = "[table] send message",
  TableSendAutomatedMessage = "[table] send automated message",
  TableUserJoined = "[table] user joined",
  TableUserLeft = "[table] user left",
  UserSignOut = "[user] sign out",
}

const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
  let socket: SocketInterface

  return (next) => async (action: unknown) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== "undefined") {
        socket = await SocketFactory.create()

        // **************************************************
        // * Socket IO Events
        // **************************************************

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

        socket.socket.on(SocketEvent.UserSignOutSuccess, (): void => {
          SocketFactory.destroy()
        })

        // **************************************************
        // * Server.js Error Events
        // **************************************************

        socket.socket.on(SocketEvent.ServerError, (message: string): void => {
          console.error(`Server error: ${message}.`)
          store.dispatch(serverError(message))
        })

        // **************************************************
        // * Room Events
        // **************************************************

        socket.socket.on(SocketEvent.RoomLeaveAllTables, ({ tableId, isLastUser }): void => {
          store.dispatch(beforeLeaveTableAction({ tableId, isLastUser }))
        })

        socket.socket.on(SocketEvent.RoomReceiveChatMessage, ({ roomId, message }): void => {
          store.dispatch(addMessageToRoomChat({ roomId, message }))
        })

        socket.socket.on(SocketEvent.RoomUserJoined, ({ roomId, towersUserProfile }): void => {
          store.dispatch(addUserToRoom({ roomId, towersUserProfile }))
        })

        socket.socket.on(SocketEvent.RoomUserLeft, ({ roomId, userId }): void => {
          store.dispatch(removeUserFromRoom({ roomId, userId }))
        })

        // **************************************************
        // * Table Events
        // **************************************************

        socket.socket.on(SocketEvent.TableAddForAllRoomUsers, ({ roomId, userId, table }): void => {
          store.dispatch(addTableToRoom({ roomId, userId, table }))
        })

        socket.socket.on(SocketEvent.TableUpdateForAllRoomUsers, ({ roomId, tableId, table }): void => {
          store.dispatch(updateTableInRoom({ roomId, tableId, table }))
        })

        socket.socket.on(SocketEvent.TableDeleteForAllRoomUsers, ({ roomId, tableId }): void => {
          store.dispatch(removeTableFromRoom({ roomId, tableId }))
        })

        socket.socket.on(SocketEvent.TableDisplayUserJoinedMessage, ({ tableId, message }): void => {
          store.dispatch(addMessageToTableChat({ tableId, message }))
        })

        socket.socket.on(SocketEvent.TableDisplayUserLeftMessage, ({ tableId, message }): void => {
          store.dispatch(addMessageToTableChat({ tableId, message }))
        })

        socket.socket.on(SocketEvent.TableReceiveChatMessage, ({ tableId, message }): void => {
          store.dispatch(addMessageToTableChat({ tableId, message }))
        })

        socket.socket.on(SocketEvent.TableUserJoined, ({ tableId, towersUserProfile }): void => {
          store.dispatch(addUserToTable({ tableId, towersUserProfile }))
        })

        socket.socket.on(SocketEvent.TableUserLeft, ({ tableId, userId }): void => {
          store.dispatch(removeUserFromTable({ tableId, userId }))
        })
      }
    }

    if (socket) {
      // **************************************************
      // * Socket IO Actions
      // **************************************************

      if (destroySocket.match(action)) {
        socket.socket.emit(SocketEvent.UserSignOut)
      }

      // **************************************************
      // * Room Actions
      // **************************************************

      if (joinRoomAction.match(action)) {
        socket.socket.emit(SocketEvent.RoomJoin, action.payload)
      }

      if (leaveRoomAction.match(action)) {
        socket.socket.emit(SocketEvent.RoomLeave, action.payload)
      }

      if (sendRoomChatMessage.match(action)) {
        socket.socket.emit(SocketEvent.RoomSendMessage, action.payload)
      }

      // **************************************************
      // * Table Actions
      // **************************************************

      if (joinTableAction.match(action)) {
        socket.socket.emit(SocketEvent.TableJoin, action.payload)
      }

      if (beforeLeaveTableAction.match(action)) {
        socket.socket.emit(SocketEvent.TableLeave, action.payload)
      }

      if (addTable.match(action)) {
        socket.socket.emit(SocketEvent.TableCreate, action.payload)
      }

      if (updateTable.match(action)) {
        socket.socket.emit(SocketEvent.TableUpdate, action.payload)
      }

      if (removeTable.match(action)) {
        socket.socket.emit(SocketEvent.TableDelete, action.payload)
      }

      if (sendTableChatMessage.match(action)) {
        socket.socket.emit(SocketEvent.TableSendMessage, action.payload)
      }

      if (sendTableAutomatedChatMessage.match(action)) {
        socket.socket.emit(SocketEvent.TableSendAutomatedMessage, action.payload)
      }
    }

    next(action)
  }
}

export default socketMiddleware
