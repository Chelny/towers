import { ITowersTable, ITowersTableChatMessage, ITowersUserProfile } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"

export const fetchTableInfo = createAsyncThunk<
  ITowersTable,
  { tableId: string; signal?: AbortSignal },
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
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchTableChat = createAsyncThunk<
  ITowersTableChatMessage[],
  { tableId: string; userId: string; signal?: AbortSignal },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId, userId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table chat"

  try {
    const response: AxiosResponse<ApiResponse<ITowersTableChatMessage[]>> = await axios.get(
      `/api/tables/${tableId}/chat?userId=${userId}`,
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
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})

export const fetchTableUsers = createAsyncThunk<
  ITowersUserProfile[],
  { tableId: string; signal?: AbortSignal },
  { rejectValue: string }
>("table/fetchTableUsers", async ({ tableId, signal }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table users"

  try {
    const response: AxiosResponse<ApiResponse<ITowersUserProfile[]>> = await axios.get(`/api/tables/${tableId}/users`, {
      signal
    })

    if (!response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log("Fetch table users request was cancelled")
    } else {
      console.error(error)
    }

    return rejectWithValue(errorMessage)
  }
})
