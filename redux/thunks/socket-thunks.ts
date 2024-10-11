import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

export type SocketRoomThunk = { roomId: string; tableId?: string }

export const joinRoom = createAsyncThunk<SocketRoomThunk, SocketRoomThunk, { rejectValue: string }>(
  "socket/joinRoom",
  async ({ roomId, tableId }: SocketRoomThunk, { rejectWithValue }) => {
    try {
      await axios.patch("/api/socket/room/join", { roomId, tableId })
      return { roomId, tableId }
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to join room")
    }
  }
)

export const leaveRoom = createAsyncThunk<SocketRoomThunk, SocketRoomThunk, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ roomId, tableId }: SocketRoomThunk, { rejectWithValue }) => {
    try {
      await axios.patch("/api/socket/room/leave", { roomId, tableId })
      return { roomId, tableId }
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to leave room")
    }
  }
)
