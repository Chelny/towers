import { createAsyncThunk } from "@reduxjs/toolkit"
import { TableChatResponseData, TableResponseData, TableUsersResponseData } from "@/interfaces"

export const fetchTableData = createAsyncThunk<TableResponseData, string, { rejectValue: string }>(
  "table/fetchTableData",
  async (tableId, { rejectWithValue }) => {
    const errorMesage: string = "Failed to fetch table data"

    try {
      const response: Response = await fetch(`/api/tables/${tableId}`)

      if (!response.ok) throw new Error(errorMesage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMesage)
    }
  }
)

export const fetchTableChatData = createAsyncThunk<
  TableChatResponseData,
  { tableId: string; towersUserId: string },
  { rejectValue: string }
>("table/fetchTableChatData", async ({ tableId, towersUserId }, { rejectWithValue }) => {
  const errorMesage: string = "Failed to fetch table chat data"

  try {
    const response: Response = await fetch(`/api/tables/${tableId}/chat?towersUserId=${towersUserId}`)

    if (!response.ok) throw new Error(errorMesage)

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error(error)
    return rejectWithValue(errorMesage)
  }
})

export const fetchTableUsersData = createAsyncThunk<TableUsersResponseData, string, { rejectValue: string }>(
  "table/fetchTableUsersData",
  async (tableId, { rejectWithValue }) => {
    const errorMesage: string = "Failed to fetch table users data"

    try {
      const response: Response = await fetch(`/api/tables/${tableId}/users`)

      if (!response.ok) throw new Error(errorMesage)

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue(errorMesage)
    }
  }
)
