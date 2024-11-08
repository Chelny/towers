import { ITowersTable, ITowersTableChatMessage, ITowersUserRoomTable } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { Session } from "next-auth"
import { fetchRoomUsers } from "@/redux/thunks/room-thunks"
import { isAbortError } from "@/utils/http-utils"

export interface SocketTableThunkProps {
  roomId: string
  tableId: string
}

export interface SocketTableThunkResponse {
  roomId: string
  tableId: string
  towersUserRoomTable?: ITowersUserRoomTable
}

export const joinTable = createAsyncThunk<SocketTableThunkResponse, SocketTableThunkProps, { rejectValue: string }>(
  "socket/joinTable",
  async ({ roomId, tableId }: SocketTableThunkProps, { signal, rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/join`, {
        method: "PATCH",
        body: JSON.stringify({ roomId, tableId }),
        signal,
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message || "Failed to join table")
      }

      const result: ApiResponse<ITowersUserRoomTable> = await response.json()
      return { roomId, tableId, towersUserRoomTable: result.data }
    } catch (error) {
      if (isAbortError(error)) {
        console.log("Join table request was cancelled")
      } else {
        console.error(error)
      }

      return rejectWithValue("Failed to join table")
    }
  },
)

export const leaveTable = createAsyncThunk<SocketTableThunkResponse, SocketTableThunkProps, { rejectValue: string }>(
  "socket/leaveTable",
  async ({ roomId, tableId }: SocketTableThunkProps, { signal, dispatch, rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/leave`, {
        method: "PATCH",
        body: JSON.stringify({ roomId, tableId }),
        signal,
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message || "Failed to leave table")
      }

      dispatch(fetchRoomUsers({ roomId }))
      dispatch(fetchTableUsers({ roomId, tableId }))

      return { roomId, tableId }
    } catch (error) {
      if (isAbortError(error)) {
        console.log("Leave table request was cancelled")
      } else {
        console.error(error)
      }

      return rejectWithValue("Failed to leave table")
    }
  },
)

export const fetchTableInfo = createAsyncThunk<
  ITowersTable,
  { roomId: string; tableId: string; signal?: AbortSignal },
  { rejectValue: string }
>("table/fetchTableInfo", async ({ tableId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table info"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}`, { signal })

    if (!response.ok) {
      const errorData: ApiResponse = await response.json()
      throw new Error(errorData?.message)
    }

    const result: ApiResponse<ITowersTable> = await response.json()

    if (!result.data) {
      return rejectWithValue(errorMessage)
    }

    return result.data
  } catch (error) {
    if (isAbortError(error)) {
      console.log("Fetch table info request was cancelled")
    } else {
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchTableChat = createAsyncThunk<
  ITowersTableChatMessage[],
  { roomId: string; tableId: string; session: Session; signal?: AbortSignal },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId, session, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table chat"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}/chat?userId=${session?.user.id}`, { signal })

    if (!response.ok) {
      const errorData: ApiResponse = await response.json()
      throw new Error(errorData?.message)
    }

    const result: ApiResponse<ITowersTableChatMessage[]> = await response.json()

    if (!result.data) {
      return rejectWithValue(errorMessage)
    }

    return result.data
  } catch (error) {
    if (isAbortError(error)) {
      console.log("Fetch table chat request was cancelled")
    } else {
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchTableUsers = createAsyncThunk<
  ITowersUserRoomTable[],
  { roomId: string; tableId: string; signal?: AbortSignal },
  { rejectValue: string }
>("table/fetchTableUsers", async ({ tableId, signal }, { dispatch, rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table users"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}/users`, { signal })

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
      console.log("Fetch table users request was cancelled")
    } else {
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})
