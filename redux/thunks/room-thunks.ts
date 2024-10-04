import { RoomInfoWithTablesCount, RoomMessage, TowersUser } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"

export const fetchRoomInfo = createAsyncThunk<RoomInfoWithTablesCount, { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomInfo",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room data"

    try {
      const response: AxiosResponse<ApiResponse<RoomInfoWithTablesCount>> = await axios.get(`/api/rooms/${roomId}`)

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

export const fetchRoomChat = createAsyncThunk<RoomMessage[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomChat",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room chat data"

    try {
      const response: AxiosResponse<ApiResponse<RoomMessage[]>> = await axios.get(`/api/rooms/${roomId}/chat`)

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

export const fetchRoomUsers = createAsyncThunk<TowersUser[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomUsers",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room users data"

    try {
      const response: AxiosResponse<ApiResponse<TowersUser[]>> = await axios.get(`/api/rooms/${roomId}/users`)

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
