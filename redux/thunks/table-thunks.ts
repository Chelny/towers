import { createAsyncThunk } from "@reduxjs/toolkit"
import {
  TableChatWithTowersGameUser,
  TableWithHostAndTowersGameUsers,
  TowersGameUserWithUserAndTables
} from "@/interfaces"

export const fetchTableInfo = createAsyncThunk<TableWithHostAndTowersGameUsers, string, { rejectValue: string }>(
  "table/fetchTableInfo",
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

export const fetchTableChat = createAsyncThunk<
  TableChatWithTowersGameUser[],
  { tableId: string; towersUserId: string },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId, towersUserId }, { rejectWithValue }) => {
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

export const fetchTableUsers = createAsyncThunk<TowersGameUserWithUserAndTables[], string, { rejectValue: string }>(
  "table/fetchTableUsers",
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
