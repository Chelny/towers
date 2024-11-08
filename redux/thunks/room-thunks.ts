import { ITowersRoom, ITowersRoomChatMessage, ITowersTable, ITowersUserRoomTable } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { isAbortError } from "@/utils/http-utils"

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
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/join`, {
        method: "PATCH",
        body: JSON.stringify({ roomId }),
        signal,
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      const result = await response.json()
      return { roomId, towersUserRoomTable: result.data }
    } catch (error) {
      if (isAbortError(error)) {
        console.log("Join room request was cancelled")
      } else {
        console.error(error)
      }

      return rejectWithValue("Failed to join room")
    }
  },
)

export const leaveRoom = createAsyncThunk<SocketRoomThunkResponse, SocketRoomThunkProps, { rejectValue: string }>(
  "socket/leaveRoom",
  async ({ roomId }: SocketRoomThunkProps, { signal, rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/leave`, {
        method: "PATCH",
        body: JSON.stringify({ roomId }),
        signal,
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message)
      }

      return { roomId }
    } catch (error) {
      if (isAbortError(error)) {
        console.log("Leave room request was cancelled")
      } else {
        console.error(error)
      }

      return rejectWithValue("Failed to leave room")
    }
  },
)

export const fetchRoomInfo = createAsyncThunk<
  ITowersRoom,
  { roomId: string; signal?: AbortSignal },
  { rejectValue: string }
>("socket/fetchRoomInfo", async ({ roomId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch room info"

  try {
    const response: Response = await fetch(`/api/rooms/${roomId}`, { signal })

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
    if (isAbortError(error)) {
      console.log("Fetch room info request was cancelled")
    } else {
      console.error(error)
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
    const response: Response = await fetch(`/api/rooms/${roomId}/chat`, { signal })

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
    if (isAbortError(error)) {
      console.log("Fetch room chat request was cancelled")
    } else {
      console.error(error)
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
    const response: Response = await fetch(`/api/rooms/${roomId}/users`, { signal })

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
    if (isAbortError(error)) {
      console.log("Fetch room users request was cancelled")
    } else {
      console.error(error)
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
    const response: Response = await fetch(`/api/rooms/${roomId}/tables`, { signal })

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
    if (isAbortError(error)) {
      console.log("Fetch room tables request was cancelled")
    } else {
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})
