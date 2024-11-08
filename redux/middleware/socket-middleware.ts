import { ITowersUserRoomTable, TableChatMessageType } from "@prisma/client"
import { Middleware, MiddlewareAPI } from "redux"
import { SocketState, TowersTableState } from "@/interfaces/socket"
import { SocketFactory, SocketInterface } from "@/lib/socket-factory"
import {
  addMessageToRoomChat,
  addMessageToTableChat,
  addTable,
  addTableToRoom,
  addUserToRoom,
  addUserToTable,
  connectionEstablished,
  connectionLost,
  destroySocket,
  initSocket,
  joinRoomSocketRoom,
  joinTableSocketRoom,
  leaveRoomSocketRoom,
  leaveTableSocketRoom,
  removeTable,
  removeTableFromRoom,
  removeUserFromRoom,
  removeUserFromTable,
  sendRoomChatMessage,
  sendTableAutomatedChatMessage,
  sendTableChatMessage,
  serverError,
  updateTable,
  updateTableInRoom,
  updateUsers,
  updateUsersInRoom,
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
  Ping = "ping",
  Error = "error",

  // Custom Listeners
  RoomLeaveAllTables = "[room] leave all room tables",
  RoomUserJoined = "[room] user joined",
  RoomUserLeft = "[room] user left",
  RoomAddTableForRoomUsers = "[room] add table for room users",
  RoomUpdateTableForRoomUsers = "[room] update table for room users",
  RoomRemoveTableForRoomUsers = "[room] remove table for room users",
  RoomReceiveChatMessage = "[room] receive new chat message",
  RoomUpdateUsersForRoomUsers = "[room] update users for room users",
  TableReceiveChatMessage = "[table] receive new chat message",
  TableUserJoined = "[table] user joined",
  TableUserLeft = "[table] user left",
  SocketDisconnectSuccess = "[socket] disconnect success",
  ServerError = "[server] error",

  // Emitters
  RoomJoin = "[room] join",
  RoomLeave = "[room] leave",
  RoomSendMessage = "[room] send message",
  RoomUpdateUsers = "[room] update users",
  TableJoin = "[table] join",
  TableLeave = "[table] leave",
  TableCreate = "[table] create",
  TableUpdate = "[table] update",
  TableDelete = "[table] delete",
  TableSendMessage = "[table] send message",
  TableSendAutomatedMessage = "[table] send automated message",
  SocketReconnect = "[socket] reconnect",
  SocketDisconnect = "[socket] disconnect",
}

const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
  let socket: SocketInterface | null = null

  return (next) => async (action: unknown) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== "undefined") {
        socket = await SocketFactory.create(action.payload.session)

        // **************************************************
        // * Socket IO Events
        // **************************************************

        socket.socket.on(SocketEvent.Connect, (): void => {
          store.dispatch(connectionEstablished())
          console.info(`User connected with socket ID: ${socket?.socket.id}.`)
        })

        socket.socket.on(SocketEvent.ConnectError, (error: Error): void => {
          console.error(`Connection error: ${error.message}.`)
          store.dispatch(connectionLost(error.message))
        })

        socket.socket.on(SocketEvent.Disconnect, (reason: string): void => {
          store.dispatch(connectionLost(reason))
          console.info(`Disconnected due to ${reason}.`)
        })

        socket.socket.on(SocketEvent.Reconnect, (attempt: number): void => {
          store.dispatch(connectionEstablished())
          console.info(`Reconnected successfully after ${attempt} attempts.`)
        })

        socket.socket.on(SocketEvent.ReconnectAttempt, (attempt: number): void => {
          console.info(`Attempting to reconnect to the socket... Attempt number: ${attempt}.`)
        })

        socket.socket.on(SocketEvent.ReconnectError, (error: Error): void => {
          console.error(`Reconnection error: ${error.message}.`)
          store.dispatch(connectionLost(error.message))
        })

        socket.socket.on(SocketEvent.ReconnectFailed, (): void => {
          console.error("Reconnection failed.")
          store.dispatch(connectionLost("Reconnection failed."))
        })

        socket.socket.on(SocketEvent.Ping, (): void => {
          console.info("Ping event received.")
        })

        socket.socket.on(SocketEvent.Error, (error: Error): void => {
          console.error(`Socket error: ${error.message}.`)
        })

        socket.socket.on(SocketEvent.SocketDisconnectSuccess, (): void => {
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

        socket.socket.on(SocketEvent.RoomLeaveAllTables, ({ roomId, tableId }): void => {
          store.dispatch(leaveTableSocketRoom({ roomId, tableId }))
        })

        socket.socket.on(SocketEvent.RoomReceiveChatMessage, ({ roomId, message }): void => {
          store.dispatch(addMessageToRoomChat({ roomId, message }))
        })

        socket.socket.on(SocketEvent.RoomUserJoined, ({ roomId, towersUserRoomTable }): void => {
          store.dispatch(addUserToRoom({ roomId, towersUserRoomTable }))
        })

        socket.socket.on(SocketEvent.RoomUserLeft, ({ roomId, userId }): void => {
          store.dispatch(removeUserFromRoom({ roomId, userId }))
        })

        socket.socket.on(SocketEvent.RoomUpdateUsersForRoomUsers, ({ roomId, users }): void => {
          store.dispatch(updateUsersInRoom({ roomId, users }))
        })

        // **************************************************
        // * Table Events
        // **************************************************

        socket.socket.on(SocketEvent.RoomAddTableForRoomUsers, ({ roomId, info }): void => {
          store.dispatch(addTableToRoom({ roomId, info }))
        })

        socket.socket.on(SocketEvent.RoomUpdateTableForRoomUsers, ({ roomId, tableId, info, users }): void => {
          store.dispatch(updateTableInRoom({ roomId, tableId, info, users }))
        })

        socket.socket.on(SocketEvent.RoomRemoveTableForRoomUsers, ({ roomId, tableId }): void => {
          store.dispatch(removeTableFromRoom({ roomId, tableId }))
        })

        socket.socket.on(SocketEvent.TableReceiveChatMessage, ({ roomId, tableId, message }): void => {
          store.dispatch(addMessageToTableChat({ roomId, tableId, message }))
        })

        socket.socket.on(SocketEvent.TableUserJoined, ({ roomId, tableId, towersUserRoomTable }): void => {
          store.dispatch(addUserToTable({ roomId, tableId, towersUserRoomTable }))
        })

        socket.socket.on(SocketEvent.TableUserLeft, ({ roomId, tableId, user }): void => {
          store.dispatch(removeUserFromTable({ roomId, tableId, userId: user.id }))

          // Send new host of table message to the next user in line
          const state: SocketState = store.getState().socket
          const table: TowersTableState = state.towers[roomId]?.tables?.[tableId]

          if (table) {
            const nextTableHost: ITowersUserRoomTable = table.users
              ?.slice()
              .sort(
                (a: ITowersUserRoomTable, b: ITowersUserRoomTable) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
              )?.[0]

            if (table.users?.length > 0) {
              store.dispatch(
                sendTableAutomatedChatMessage({
                  roomId,
                  tableId,
                  message: `${user.username} left the table.`,
                  type: TableChatMessageType.USER_ACTION,
                }),
              )

              if (table.info && nextTableHost && table.info?.host?.userId === user.id) {
                store.dispatch(
                  updateTable({
                    roomId,
                    tableId,
                    info: {
                      ...table.info,
                      host: nextTableHost?.userProfile,
                    },
                    users: table.users,
                  }),
                )

                store.dispatch(
                  sendTableAutomatedChatMessage({
                    roomId,
                    tableId,
                    message:
                      "You are the host of the table. This gives you the power to invite to [or boot people from] your table. You may also limit other player’s access to your table by selecting its \"Table Type\".",
                    type: TableChatMessageType.TABLE_HOST,
                    privateToUserId: user.id,
                  }),
                )
              }
            }
          }
        })
      }
    }

    if (socket) {
      // **************************************************
      // * Socket IO Actions
      // **************************************************

      if (destroySocket.match(action)) {
        socket.socket.emit(SocketEvent.SocketDisconnect)
      }

      // **************************************************
      // * Room Actions
      // **************************************************

      if (joinRoomSocketRoom.match(action)) {
        socket.socket.emit(SocketEvent.RoomJoin, action.payload)
      }

      if (leaveRoomSocketRoom.match(action)) {
        socket.socket.emit(SocketEvent.RoomLeave, action.payload)
      }

      if (sendRoomChatMessage.match(action)) {
        socket.socket.emit(SocketEvent.RoomSendMessage, action.payload)
      }

      if (updateUsers.match(action)) {
        socket.socket.emit(SocketEvent.RoomUpdateUsers, action.payload)
      }

      // **************************************************
      // * Table Actions
      // **************************************************

      if (joinTableSocketRoom.match(action)) {
        socket.socket.emit(SocketEvent.TableJoin, action.payload)
      }

      if (leaveTableSocketRoom.match(action)) {
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
