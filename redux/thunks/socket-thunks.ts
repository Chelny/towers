import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"

export type SocketRoomThunk = { roomId: string; tableId?: string; username: string }

export const joinRoom = createAsyncThunk<SocketRoomThunk, SocketRoomThunk, { rejectValue: string }>(
  "socket/joinRoom",
  async ({ roomId, tableId, username }: SocketRoomThunk, { rejectWithValue }) => {
    const errorMessage: string = "Failed to join room"

    try {
      const response: AxiosResponse<ApiResponse<SocketRoomThunk>> = await axios.patch("/api/socket/room/join", {
        roomId,
        tableId,
        username
      })

      if (response.status !== 200) {
        return rejectWithValue(errorMessage)
      }

      return { roomId, tableId, username }
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const leaveRoom = createAsyncThunk<SocketRoomThunk, SocketRoomThunk, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ roomId, tableId, username }: SocketRoomThunk, { rejectWithValue }) => {
    const errorMessage: string = "Failed to leave room"

    try {
      const response: AxiosResponse<ApiResponse<SocketRoomThunk>> = await axios.patch("/api/socket/room/leave", {
        roomId,
        tableId,
        username
      })

      if (response.status !== 200) {
        return rejectWithValue(errorMessage)
      }

      return { roomId, tableId, username }
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)
