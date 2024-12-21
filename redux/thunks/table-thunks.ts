import { ITowersTable, ITowersTableChatMessage, ITowersUserRoomTable } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import { Session } from "@/lib/auth-client"
import { fetchRoomUsers } from "@/redux/thunks/room-thunks"

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
  async ({ roomId, tableId }: SocketTableThunkProps, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/join`, {
        method: "PATCH",
        body: JSON.stringify({ roomId, tableId }),
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message || "Failed to join table")
      }

      const result: ApiResponse<ITowersUserRoomTable> = await response.json()
      return { roomId, tableId, towersUserRoomTable: result.data }
    } catch (error) {
      return rejectWithValue("Failed to join table")
    }
  },
)

export const leaveTable = createAsyncThunk<SocketTableThunkResponse, SocketTableThunkProps, { rejectValue: string }>(
  "socket/leaveTable",
  async ({ roomId, tableId }: SocketTableThunkProps, { dispatch, rejectWithValue }) => {
    try {
      const response: Response = await fetch(`${process.env.BASE_URL}/api/socket/room/leave`, {
        method: "PATCH",
        body: JSON.stringify({ roomId, tableId }),
      })

      if (!response.ok) {
        const errorData: ApiResponse = await response.json()
        throw new Error(errorData?.message || "Failed to leave table")
      }

      dispatch(fetchRoomUsers({ roomId }))
      dispatch(fetchTableUsers({ roomId, tableId }))

      return { roomId, tableId }
    } catch (error) {
      return rejectWithValue("Failed to leave table")
    }
  },
)

export const fetchTableInfo = createAsyncThunk<
  ITowersTable,
  { roomId: string; tableId: string },
  { rejectValue: string }
>("table/fetchTableInfo", async ({ tableId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table info"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}`)

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
    return rejectWithValue(errorMessage)
  }
})

export const fetchTableChat = createAsyncThunk<
  ITowersTableChatMessage[],
  { roomId: string; tableId: string; session: Session },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId, session }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table chat"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}/chat?userId=${session?.user.id}`)

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
    return rejectWithValue(errorMessage)
  }
})

export const fetchTableUsers = createAsyncThunk<
  ITowersUserRoomTable[],
  { roomId: string; tableId: string },
  { rejectValue: string }
>("table/fetchTableUsers", async ({ tableId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table users"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}/users`)

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
})
