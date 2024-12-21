import { ITowersRoom, ITowersRoomChatMessage, ITowersTable, ITowersUserRoomTable } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"

export interface SocketRoomThunkProps {
  roomId: string
}

export interface SocketRoomThunkResponse {
  roomId: string
  towersUserRoomTable?: ITowersUserRoomTable
}

export const joinRoom = createAsyncThunk<SocketRoomThunkResponse, SocketRoomThunkProps, { rejectValue: string }>(
  "socket/joinRoom",
  async ({ roomId }: SocketRoomThunkProps, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/join`, {
        method: "PATCH",
        body: JSON.stringify({ roomId }),
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result = await response.json()
      return { roomId, towersUserRoomTable: result.data }
    } catch (error) {
      return rejectWithValue("Failed to join room")
    }
  },
)

export const leaveRoom = createAsyncThunk<SocketRoomThunkResponse, SocketRoomThunkProps, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ roomId }: SocketRoomThunkProps, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/leave`, {
        method: "PATCH",
        body: JSON.stringify({ roomId }),
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      return { roomId }
    } catch (error) {
      return rejectWithValue("Failed to leave room")
    }
  },
)

export const fetchRoomInfo = createAsyncThunk<ITowersRoom, { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomInfo",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room info"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}`)

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result: ApiResponse<ITowersRoom> = await response.json()

      if (!result.data) {
        return rejectWithValue(errorMessage)
      }

      return result.data
    } catch (error) {
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchRoomChat = createAsyncThunk<ITowersRoomChatMessage[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomChat",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room chat"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/chat`)

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result: ApiResponse<ITowersRoomChatMessage[]> = await response.json()

      if (!result.data) {
        return rejectWithValue(errorMessage)
      }

      return result.data
    } catch (error) {
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchRoomUsers = createAsyncThunk<ITowersUserRoomTable[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomUsers",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room users"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/users`)

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result: ApiResponse<ITowersUserRoomTable[]> = await response.json()

      if (!result.data) {
        return rejectWithValue(errorMessage)
      }

      return result.data
    } catch (error) {
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchRoomTables = createAsyncThunk<ITowersTable[], { roomId: string }, { rejectValue: string }>(
  "socket/fetchRoomTables",
  async ({ roomId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch room tables"

    try {
      const response: Response = await fetch(`/api/rooms/${roomId}/tables`)

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result: ApiResponse<ITowersTable[]> = await response.json()

      if (!result.data) {
        return rejectWithValue(errorMessage)
      }

      return result.data
    } catch (error) {
      return rejectWithValue(errorMessage)
    }
  },
)
