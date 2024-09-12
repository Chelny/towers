import { createAsyncThunk } from "@reduxjs/toolkit"
import { beforeLeaveSocketRoom, joinSocketRoom } from "@/redux/features"
import store from "@/redux/store"

type SocketRoom = { room: string; isTable: boolean; username: string }

export const joinRoom = createAsyncThunk<SocketRoom, SocketRoom, { rejectValue: string }>(
  "socket/joinRoom",
  async ({ room, isTable, username }: SocketRoom, { rejectWithValue }) => {
    const errorMessage: string = "Failed to join room"

    try {
      const response: Response = await fetch("/api/room/join", {
        method: "POST",
        body: JSON.stringify({ room, isTable, username })
      })

      if (!response.ok) throw new Error(errorMessage)

      store.dispatch(joinSocketRoom({ room, isTable, username }))

      return { room, isTable, username }
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const leaveRoom = createAsyncThunk<SocketRoom, SocketRoom, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ room, isTable, username }: SocketRoom, { rejectWithValue }) => {
    const errorMessage: string = "Failed to leave room"

    try {
      const response: Response = await fetch("/api/room/leave", {
        method: "POST",
        body: JSON.stringify({ room, isTable, username })
      })

      if (!response.ok) throw new Error(errorMessage)

      store.dispatch(beforeLeaveSocketRoom({ room, isTable, username }))

      return { room, isTable, username }
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)
