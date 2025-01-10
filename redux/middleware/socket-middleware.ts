import { ITowersUserProfile, TableChatMessageType } from "@prisma/client"
import { ITowersUserTableWithRelations } from "@prisma/client"
import { Middleware, MiddlewareAPI } from "redux"
import { SocketState, TowersTableState } from "@/interfaces/socket"
import { SocketFactory, SocketInterface } from "@/lib/socket-factory"
import {
  addChatMessageToRoom,
  addChatMessageToRoomSuccess,
  addChatMessageToTable,
  addChatMessageToTableSuccess,
  addTableToRoom,
  addTableToRoomSuccess,
  connectionEstablished,
  connectionLost,
  destroySocket,
  initSocket,
  joinRoom,
  joinRoomSuccess,
  joinTable,
  joinTableSuccess,
  leaveRoom,
  leaveRoomSuccess,
  leaveTable,
  leaveTableSuccess,
  removeRoomSelf,
  removeTableFromRoom,
  removeTableFromRoomSuccess,
  removeTableSelf,
  serverError,
  updateRoomTable,
  updateRoomTableSuccess,
  updateRoomUser,
} from "@/redux/features/socket-slice"

const socketMiddleware: Middleware = (store: MiddlewareAPI) => {
  let socket: SocketInterface | null = null

  return (next) => async (action: unknown) => {
    if (initSocket.match(action)) {
      if (!socket && typeof window !== "undefined") {
        socket = await SocketFactory.create(action.payload.session)

        // **************************************************
        // * Socket IO Events
        // **************************************************

        socket.socket.on("connect", (): void => {
          store.dispatch(connectionEstablished())
          console.info(`User connected with socket ID: ${socket?.socket.id}.`)
        })

        socket.socket.on("connect_error", (error: Error): void => {
          console.error(`Connection error: ${error.message}.`)
          store.dispatch(connectionLost(error.message))
        })

        socket.socket.on("disconnect", (reason: string): void => {
          store.dispatch(connectionLost(reason))
          console.info(`Disconnected due to ${reason}.`)
        })

        socket.socket.on("reconnect", (attempt: number): void => {
          store.dispatch(connectionEstablished())
          console.info(`Reconnected successfully after ${attempt} attempts.`)
        })

        socket.socket.on("reconnect_attempt", (attempt: number): void => {
          console.info(`Attempting to reconnect to the socket... Attempt number: ${attempt}.`)
        })

        socket.socket.on("reconnect_error", (error: Error): void => {
          console.error(`Reconnection error: ${error.message}.`)
          store.dispatch(connectionLost(error.message))
        })

        socket.socket.on("reconnect_failed", (): void => {
          console.error("Reconnection failed.")
          store.dispatch(connectionLost("Reconnection failed."))
        })

        socket.socket.on("ping", (): void => {
          console.info("Ping event received.")
        })

        socket.socket.on("error", (error: Error): void => {
          console.error(`Socket error: ${error.message}.`)
        })

        socket.socket.on("socket:disconnect-success", (): void => {
          SocketFactory.destroy()
        })

        // **************************************************
        // * Server.js Error Events
        // **************************************************

        socket.socket.on("server:error", (message: string): void => {
          console.error(`Server error: ${message}.`)
          store.dispatch(serverError(message))
        })

        // **************************************************
        // * Room Events
        // **************************************************

        socket.socket.on("room:joined", ({ roomId, towersUserProfile }): void => {
          store.dispatch(joinRoomSuccess({ roomId, towersUserProfile }))
        })

        socket.socket.on("room:left", ({ roomId, user }): void => {
          store.dispatch(leaveRoomSuccess({ roomId, userId: user.id }))
        })

        socket.socket.on("room:deleted-self", ({ roomId }): void => {
          store.dispatch(removeRoomSelf({ roomId }))
        })

        socket.socket.on("room:message-sent", ({ roomId, chatMessage }): void => {
          store.dispatch(addChatMessageToRoomSuccess({ roomId, chatMessage }))
        })

        socket.socket.on("room:updated-user", ({ roomId, towersUserProfile }): void => {
          store.dispatch(updateRoomUser({ roomId, towersUserProfile }))
        })

        // **************************************************
        // * Table Events
        // **************************************************

        socket.socket.on("table:joined", ({ roomId, tableId, towersUserProfile, isUserJoinedTheTable }): void => {
          store.dispatch(joinTableSuccess({ roomId, tableId, towersUserProfile }))

          // Avoid sending joined message when refreshing the page
          if (isUserJoinedTheTable) {
            store.dispatch(
              addChatMessageToTable({
                roomId,
                tableId,
                messageVariables: { username: towersUserProfile.user.username },
                type: TableChatMessageType.USER_JOINED,
              }),
            )
          }
        })

        socket.socket.on("table:left", ({ roomId, tableId, user }): void => {
          store.dispatch(leaveTableSuccess({ roomId, tableId, userId: user.id }))
          store.dispatch(
            addChatMessageToTable({
              roomId,
              tableId,
              messageVariables: { username: user.username },
              type: TableChatMessageType.USER_LEFT,
            }),
          )

          // FIXME: Send new host of table message to the next user in line
          // const state: SocketState = store.getState().socket
          // const table: TowersTableState = state.towers.tables?.[tableId]

          // if (table) {
          //   const nextTableHost: ITowersUserProfile | undefined = table.users
          //     ?.slice()
          //     .sort((a: ITowersUserProfile, b: ITowersUserProfile) => {
          //       const aJoinTime: Date | undefined = a.userTables?.find((ut: ITowersUserTableWithRelations) => ut.tableId === tableId)?.createdAt
          //       const bJoinTime: Date | undefined = b.userTables?.find((ut: ITowersUserTableWithRelations) => ut.tableId === tableId)?.createdAt
          //       return new Date(aJoinTime || 0).getTime() - new Date(bJoinTime || 0).getTime()
          //     })?.[0]

          //   if (table.users?.length > 0) {
          //     if (table.info && nextTableHost && table.info?.host?.userId === user.id) {
          //       store.dispatch(
          //         updateRoomTable({
          //           roomId,
          //           tableId,
          //           table: {
          //             ...table.info,
          //             host: nextTableHost,
          //           },
          //           towersUserProfiles: table.users,
          //         }),
          //       )

          //       store.dispatch(
          //         addChatMessageToTable({
          //           roomId,
          //           tableId,
          //           type: TableChatMessageType.TABLE_HOST,
          //         }),
          //       )
          //     }
          //   }
          // }
        })

        socket.socket.on("table:deleted-self", ({ tableId }): void => {
          store.dispatch(removeTableSelf({ tableId }))
        })

        socket.socket.on("table:message-sent", ({ roomId, tableId, chatMessage }): void => {
          store.dispatch(addChatMessageToTableSuccess({ roomId, tableId, chatMessage }))
        })

        socket.socket.on("table:created", ({ roomId, table }): void => {
          store.dispatch(addTableToRoomSuccess({ roomId, table }))
        })

        socket.socket.on("table:updated", ({ roomId, tableId, table, towersUserProfiles }): void => {
          store.dispatch(updateRoomTableSuccess({ roomId, tableId, table, towersUserProfiles }))
        })

        socket.socket.on("table:deleted", ({ roomId, tableId }): void => {
          store.dispatch(removeTableFromRoomSuccess({ roomId, tableId }))
        })
      }
    }

    if (socket) {
      // **************************************************
      // * Socket IO Actions
      // **************************************************

      if (destroySocket.match(action)) {
        socket.socket.emit("socket:disconnect")
      }

      // **************************************************
      // * Room Actions
      // **************************************************

      if (joinRoom.match(action)) {
        socket.socket.emit("room:join", action.payload)
      }

      if (leaveRoom.match(action)) {
        socket.socket.emit("room:leave", action.payload)
      }

      if (updateRoomUser.match(action)) {
        socket.socket.emit("room:update-user", action.payload)
      }

      if (addChatMessageToRoom.match(action)) {
        socket.socket.emit("room:send-message", action.payload)
      }

      // **************************************************
      // * Table Actions
      // **************************************************

      if (joinTable.match(action)) {
        socket.socket.emit("table:join", action.payload)
      }

      if (leaveTable.match(action)) {
        socket.socket.emit("table:leave", action.payload)
      }

      if (addChatMessageToTable.match(action)) {
        socket.socket.emit("table:send-message", action.payload)
      }

      if (addTableToRoom.match(action)) {
        socket.socket.emit("table:create", action.payload)
      }

      if (updateRoomTable.match(action)) {
        socket.socket.emit("table:update", action.payload)
      }

      if (removeTableFromRoom.match(action)) {
        socket.socket.emit("table:delete", action.payload)
      }
    }

    next(action)
  }
}

export default socketMiddleware
