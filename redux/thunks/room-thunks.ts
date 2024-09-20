import { createAsyncThunk } from "@reduxjs/toolkit"
import { RoomChatWithTowersGameUser, RoomWithTablesCount, TowersGameUserWithUserAndTables } from "@/interfaces"

export const fetchRoomInfo = createAsyncThunk<RoomWithTablesCount, string, { rejectValue: string }>(
  "socket/fetchRoomInfo",
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

export const fetchRoomChat = createAsyncThunk<RoomChatWithTowersGameUser[], string, { rejectValue: string }>(
  "socket/fetchRoomChat",
  async (roomId, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room chat data"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/chat`)

      if (!response.ok) throw new Error(errorMessage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchRoomUsers = createAsyncThunk<TowersGameUserWithUserAndTables[], string, { rejectValue: string }>(
  "socket/fetchRoomUsers",
  async (roomId, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room users data"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/users`)

      if (!response.ok) throw new Error(errorMessage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)
