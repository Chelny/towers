import { t } from "@lingui/core/macro"
import { ITowersTable, ITowersTableChatMessage, ITowersUserProfile } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"

export const fetchTableInfo = createAsyncThunk<
  ITowersTable,
  { roomId: string; tableId: string },
  { rejectValue: string }
>("table/fetchTableInfo", async ({ tableId }, { rejectWithValue }) => {
  try {
    const response: Response = await fetch(`/api/tables/${tableId}`)

    if (!response.ok) {
      const error: ApiResponse = await response.json()
      throw new Error(error?.message)
    }

    const result: ApiResponse<ITowersTable> = await response.json()

    if (!result.data) {
      throw new Error(t({ message: "Unable to load table info." }))
    }

    return result.data
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
    return rejectWithValue(errorMessage)
  }
})

export const fetchTableChat = createAsyncThunk<
  ITowersTableChatMessage[],
  { roomId: string; tableId: string },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId }, { rejectWithValue }) => {
  try {
    const response: Response = await fetch(`/api/tables/${tableId}/chat`)

    if (!response.ok) {
      const error: ApiResponse = await response.json()
      throw new Error(error?.message)
    }

    const result: ApiResponse<ITowersTableChatMessage[]> = await response.json()

    if (!result.data) {
      throw new Error(t({ message: "Unable to load table chat." }))
    }

    return result.data
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
    return rejectWithValue(errorMessage)
  }
})

export const fetchTableUsers = createAsyncThunk<
  ITowersUserProfile[],
  { roomId: string; tableId: string },
  { rejectValue: string }
>("table/fetchTableUsers", async ({ tableId }, { rejectWithValue }) => {
  try {
    const response: Response = await fetch(`/api/tables/${tableId}/users`)

    if (!response.ok) {
      const error: ApiResponse = await response.json()
      throw new Error(error?.message)
    }

    const result: ApiResponse<ITowersUserProfile[]> = await response.json()

    if (!result.data) {
      throw new Error(t({ message: "Unable to load table users." }))
    }

    return result.data
  } catch (error) {
    const errorMessage: string = error instanceof Error ? error.message : t({ message: "Unknown error occurred" })
    return rejectWithValue(errorMessage)
  }
})
