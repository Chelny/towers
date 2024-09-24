import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"

export type SocketRoomThunk = { room: string; isTable: boolean; username: string }

export const joinRoom = createAsyncThunk<SocketRoomThunk, SocketRoomThunk, { rejectValue: string }>(
  "socket/joinRoom",
  async ({ room, isTable, username }: SocketRoomThunk, { rejectWithValue }) => {
    const errorMessage: string = "Failed to join room"

    try {
      const response: AxiosResponse<ApiResponse<SocketRoomThunk>> = await axios.patch("/api/socket/room/join", {
        room,
        isTable,
        username
      })

      if (response.status !== 200) {
        return rejectWithValue(errorMessage)
      }

      return { room, isTable, username }
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const leaveRoom = createAsyncThunk<SocketRoomThunk, SocketRoomThunk, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ room, isTable, username }: SocketRoomThunk, { rejectWithValue }) => {
    const errorMessage: string = "Failed to leave room"

    try {
      const response: AxiosResponse<ApiResponse<SocketRoomThunk>> = await axios.patch("/api/socket/room/leave", {
        room,
        isTable,
        username
      })

      if (response.status !== 200) {
        return rejectWithValue(errorMessage)
      }

      return { room, isTable, username }
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)
