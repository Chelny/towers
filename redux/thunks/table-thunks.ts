import { ITowersTable, ITowersTableChatMessage, ITowersUserRoomTable } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse, CancelTokenSource } from "axios"
import { Session } from "next-auth"
import { fetchRoomUsers } from "@/redux/thunks/room-thunks"
import { getAxiosError } from "@/utils/api"

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
      const source: CancelTokenSource = axios.CancelToken.source()

      signal.addEventListener("abort", () => {
        source.cancel()
      })

      const response = await axios.patch("/api/socket/room/join", { roomId, tableId })

      return { roomId, tableId, towersUserRoomTable: response.data.data }
    } catch (error) {
      getAxiosError(error)
      return rejectWithValue("Failed to join table")
    }
  }
)

export const leaveTable = createAsyncThunk<SocketTableThunkResponse, SocketTableThunkProps, { rejectValue: string }>(
  "socket/leaveTable",
  async ({ roomId, tableId }: SocketTableThunkProps, { signal, dispatch, rejectWithValue }) => {
    try {
      const source: CancelTokenSource = axios.CancelToken.source()

      signal.addEventListener("abort", () => {
        source.cancel()
      })

      await axios.patch("/api/socket/room/leave", { roomId, tableId })

      dispatch(fetchRoomUsers({ roomId }))
      dispatch(fetchTableUsers({ roomId, tableId }))

      return { roomId, tableId }
    } catch (error) {
      getAxiosError(error)
      return rejectWithValue("Failed to leave table")
    }
  }
)

export const fetchTableInfo = createAsyncThunk<
  ITowersTable,
  { roomId: string; tableId: string; signal?: AbortSignal },
  { rejectValue: string }
>("table/fetchTableInfo", async ({ tableId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table info"

  try {
    const response: AxiosResponse<ApiResponse<ITowersTable>> = await axios.get(`/api/tables/${tableId}`, { signal })

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch table info request was cancelled")
    } else {
      getAxiosError(error)
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
    const response: AxiosResponse<ApiResponse<ITowersTableChatMessage[]>> = await axios.get(
      `/api/tables/${tableId}/chat?userId=${session?.user.id}`,
      { signal }
    )

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch table chat request was cancelled")
    } else {
      getAxiosError(error)
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
    const response: AxiosResponse<ApiResponse<ITowersUserRoomTable[]>> = await axios.get(
      `/api/tables/${tableId}/users`,
      { signal }
    )

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch table users request was cancelled")
    } else {
      getAxiosError(error)
    }

    return rejectWithValue(errorMessage)
  }
})
