import { t } from "@lingui/core/macro"
import { ITowersRoom, ITowersRoomChatMessage, ITowersTable, ITowersUserProfile } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"

export const fetchRoomInfo = createAsyncThunk<ITowersRoom, { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomInfo",
  async ({ roomId }, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`/api/rooms/${roomId}`)

      if (!response.ok) {
        const error: ApiResponse = await response.json()
        throw new Error(error?.message)
      }

      const result: ApiResponse<ITowersRoom> = await response.json()

      if (!result.data) {
        throw new Error(t({ message: "Unable to load room info." }))
      }

      return result.data
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchRoomChat = createAsyncThunk<ITowersRoomChatMessage[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomChat",
  async ({ roomId }, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/chat`)

      if (!response.ok) {
        const error: ApiResponse = await response.json()
        throw new Error(error?.message)
      }

      const result: ApiResponse<ITowersRoomChatMessage[]> = await response.json()

      if (!result.data) {
        throw new Error(t({ message: "Unable to load room chat." }))
      }

      return result.data
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchRoomUsers = createAsyncThunk<ITowersUserProfile[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomUsers",
  async ({ roomId }, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/users`)

      if (!response.ok) {
        const error: ApiResponse = await response.json()
        throw new Error(error?.message)
      }

      const result: ApiResponse<ITowersUserProfile[]> = await response.json()

      if (!result.data) {
        throw new Error(t({ message: "Unable to load room users." }))
      }

      return result.data
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchRoomTables = createAsyncThunk<ITowersTable[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomTables",
  async ({ roomId }, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/tables`)

      if (!response.ok) {
        const error: ApiResponse = await response.json()
        throw new Error(error?.message)
      }

      const result: ApiResponse<ITowersTable[]> = await response.json()

      if (!result.data) {
        throw new Error(t({ message: "Unable to load room tables." }))
      }

      return result.data
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
      return rejectWithValue(errorMessage)
    }
  },
)
