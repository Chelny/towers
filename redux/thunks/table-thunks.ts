import { createAsyncThunk } from "@reduxjs/toolkit"
import { TableChatResponseData, TableResponseData, TableUsersResponseData } from "@/interfaces"

export const fetchTableData = createAsyncThunk<TableResponseData, string, { rejectValue: string }>(
  "table/fetchTableData",
  async (tableId, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`/api/tables/${tableId}`)

      if (!response.ok) throw new Error("Failed to fetch table data")

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to fetch table data")
    }
  }
)

export const fetchTableChatData = createAsyncThunk<
  TableChatResponseData,
  { tableId: string; towersUserId: string },
  { rejectValue: string }
>("table/fetchTableChatData", async ({ tableId, towersUserId }, { rejectWithValue }) => {
  try {
    const response: Response = await fetch(`/api/table-chat?tableId=${tableId}&currentTowersUserId=${towersUserId}`)

    if (!response.ok) throw new Error("Failed to fetch table chat data")

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error(error)
    return rejectWithValue("Failed to fetch table chat data")
  }
})

export const fetchTableUsersData = createAsyncThunk<TableUsersResponseData, string, { rejectValue: string }>(
  "table/fetchTableUsersData",
  async (tableId, { rejectWithValue }) => {
    try {
      const response: Response = await fetch(`/api/towers-users?tableId=${tableId}`)

      if (!response.ok) throw new Error("Failed to fetch table users data")

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to fetch table users data")
    }
  }
)
