import { TableInfo, TableMessage, TowersUser } from "@prisma/client"
import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"

export const fetchTableInfo = createAsyncThunk<TableInfo, { tableId: string }, { rejectValue: string }>(
  "table/fetchTableInfo",
  async ({ tableId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch table data"

    try {
      const response: AxiosResponse<ApiResponse<TableInfo>> = await axios.get(`/api/tables/${tableId}`)

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

export const fetchTableChat = createAsyncThunk<
  TableMessage[],
  { tableId: string; towersUserProfileId: string },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId, towersUserProfileId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table chat data"

  try {
    const response: AxiosResponse<ApiResponse<TableMessage[]>> = await axios.get(
      `/api/tables/${tableId}/chat?towersUserProfileId=${towersUserProfileId}`
    )

    if (response.status !== 200 || !response.data.data) {
      return rejectWithValue(errorMessage)
    }

    return response.data.data
  } catch (error) {
    console.error(error)
    return rejectWithValue(errorMessage)
  }
})

export const fetchTableUsers = createAsyncThunk<TowersUser[], { tableId: string }, { rejectValue: string }>(
  "table/fetchTableUsers",
  async ({ tableId }, { rejectWithValue }) => {
    const errorMessage: string = "Failed to fetch table users data"

    try {
      const response: AxiosResponse<ApiResponse<TowersUser[]>> = await axios.get(`/api/tables/${tableId}/users`)

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
