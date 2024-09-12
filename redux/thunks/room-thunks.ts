import { createAsyncThunk } from "@reduxjs/toolkit"
import { RoomChatResponseData, RoomResponseData, RoomUsersResponseData } from "@/interfaces"

export const fetchRoomData = createAsyncThunk<RoomResponseData, string, { rejectValue: string }>(
  "socket/fetchRoomData",
  async (roomId, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room data"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}`)

      if (!response.ok) throw new Error(errorMessage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchRoomChatData = createAsyncThunk<RoomChatResponseData, string, { rejectValue: string }>(
  "socket/fetchRoomChatData",
  async (roomId, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room chat data"

    try {
      const response: Response = await fetch(`/api/room-chat/${roomId}`)

      if (!response.ok) throw new Error(errorMessage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchRoomUsersData = createAsyncThunk<RoomUsersResponseData, string, { rejectValue: string }>(
  "socket/fetchRoomUsersData",
  async (roomId, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room users data"

    try {
      const response: Response = await fetch(`/api/towers-users?roomId=${roomId}`)

      if (!response.ok) throw new Error(errorMessage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)
