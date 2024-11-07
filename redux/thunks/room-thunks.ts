import { ITowersRoom, ITowersRoomChatMessage, ITowersTable, ITowersUserRoomTable } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse, CancelTokenSource } from "axios"
import { getAxiosError } from "@/utils/api"

export interface SocketRoomThunkProps {
  roomId: string
}

export interface SocketRoomThunkResponse {
  roomId: string
  towersUserRoomTable?: ITowersUserRoomTable
}

export const joinRoom = createAsyncThunk<SocketRoomThunkResponse, SocketRoomThunkProps, { rejectValue: string }>(
  "socket/joinRoom",
  async ({ roomId }: SocketRoomThunkProps, { signal, rejectWithValue }) => {
    try {
      const source: CancelTokenSource = axios.CancelToken.source()

      signal.addEventListener("abort", () => {
        source.cancel()
      })

      const response = await axios.patch("/api/socket/room/join", { roomId })
      return { roomId, towersUserRoomTable: response.data.data }
    } catch (error) {
      getAxiosError(error)
      return rejectWithValue("Failed to join room")
    }
  }
)

export const leaveRoom = createAsyncThunk<SocketRoomThunkResponse, SocketRoomThunkProps, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ roomId }: SocketRoomThunkProps, { signal, rejectWithValue }) => {
    try {
      const source: CancelTokenSource = axios.CancelToken.source()

      signal.addEventListener("abort", () => {
        source.cancel()
      })

      await axios.patch("/api/socket/room/leave", { roomId })
      return { roomId }
    } catch (error) {
      getAxiosError(error)
      return rejectWithValue("Failed to leave room")
    }
  }
)

export const fetchRoomInfo = createAsyncThunk<
  ITowersRoom,
  { roomId: string; signal?: AbortSignal },
  { rejectValue: string }
>("socket/fetchRoomInfo", async ({ roomId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room info"

  try {
    const response: AxiosResponse<ApiResponse<ITowersRoom>> = await axios.get(`/api/rooms/${roomId}`, { signal })

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch room info request was cancelled")
    } else {
      getAxiosError(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchRoomChat = createAsyncThunk<
  ITowersRoomChatMessage[],
  { roomId: string; signal?: AbortSignal },
  { rejectValue: string }
>("socket/fetchRoomChat", async ({ roomId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room chat"

  try {
    const response: AxiosResponse<ApiResponse<ITowersRoomChatMessage[]>> = await axios.get(
      `/api/rooms/${roomId}/chat`,
      { signal }
    )

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch room chat request was cancelled")
    } else {
      getAxiosError(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchRoomUsers = createAsyncThunk<
  ITowersUserRoomTable[],
  { roomId: string; signal?: AbortSignal },
  { rejectValue: string }
>("socket/fetchRoomUsers", async ({ roomId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room users"

  try {
    const response: AxiosResponse<ApiResponse<ITowersUserRoomTable[]>> = await axios.get(`/api/rooms/${roomId}/users`, {
      signal
    })

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch room users request was cancelled")
    } else {
      getAxiosError(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchRoomTables = createAsyncThunk<
  ITowersTable[],
  { roomId: string; signal?: AbortSignal },
  { rejectValue: string }
>("socket/fetchRoomTables", async ({ roomId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room tables"

  try {
    const response: AxiosResponse<ApiResponse<ITowersTable[]>> = await axios.get(`/api/rooms/${roomId}/tables`, {
      signal
    })

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch room tables request was cancelled")
    } else {
      getAxiosError(error)
    }

    return rejectWithValue(errorMessage)
  }
})
