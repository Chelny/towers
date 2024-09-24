import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"
import { RoomWithTablesCount } from "@/interfaces/room"
import { RoomChatWithTowersGameUser } from "@/interfaces/room-chat"
import { TowersGameUserWithUserAndTables } from "@/interfaces/towers-game-user"

export const fetchRoomInfo = createAsyncThunk<RoomWithTablesCount, { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomInfo",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room data"

    try {
      const response: AxiosResponse<ApiResponse<RoomWithTablesCount>> = await axios.get(`/api/rooms/${roomId}`)

      if (response.status !== 200 || !response.data.data) {
        return rejectWithValue(errorMessage)
      }

      return response.data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMessage)
    }
  }
)

export const fetchRoomChat = createAsyncThunk<
  RoomChatWithTowersGameUser[],
  { roomId: string },
  { rejectValue: string }
>("socket/fetchRoomChat", async ({ roomId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room chat data"

  try {
    const response: AxiosResponse<ApiResponse<RoomChatWithTowersGameUser[]>> = await axios.get(
      `/api/rooms/${roomId}/chat`
    )

    if (response.status !== 200 || !response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    console.error(error)
    return rejectWithValue(errorMessage)
  }
})

export const fetchRoomUsers = createAsyncThunk<
  TowersGameUserWithUserAndTables[],
  { roomId: string },
  { rejectValue: string }
>("socket/fetchRoomUsers", async ({ roomId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room users data"

  try {
    const response: AxiosResponse<ApiResponse<TowersGameUserWithUserAndTables[]>> = await axios.get(
      `/api/rooms/${roomId}/users`
    )

    if (response.status !== 200 || !response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    console.error(error)
    return rejectWithValue(errorMessage)
  }
})
