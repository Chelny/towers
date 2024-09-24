import { createAsyncThunk } from "@reduxjs/toolkit"
import axios, { AxiosResponse } from "axios"
import { TableWithHostAndTowersGameUsers } from "@/interfaces/table"
import { TableChatWithTowersGameUser } from "@/interfaces/table-chat"
import { TowersGameUserWithUserAndTables } from "@/interfaces/towers-game-user"

export const fetchTableInfo = createAsyncThunk<
  TableWithHostAndTowersGameUsers,
  { tableId: string },
  { rejectValue: string }
>("table/fetchTableInfo", async ({ tableId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table data"

  try {
    const response: AxiosResponse<ApiResponse<TableWithHostAndTowersGameUsers>> = await axios.get(
      `/api/tables/${tableId}`
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

export const fetchTableChat = createAsyncThunk<
  TableChatWithTowersGameUser[],
  { tableId: string; towersUserId: string },
  { rejectValue: string }
>("table/fetchTableChat", async ({ tableId, towersUserId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table chat data"

  try {
    const response: AxiosResponse<ApiResponse<TableChatWithTowersGameUser[]>> = await axios.get(
      `/api/tables/${tableId}/chat?towersUserId=${towersUserId}`
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

export const fetchTableUsers = createAsyncThunk<
  TowersGameUserWithUserAndTables[],
  { tableId: string },
  { rejectValue: string }
>("table/fetchTableUsers", async ({ tableId }, { rejectWithValue }) => {
  const errorMessage: string = "Failed to fetch table users data"

  try {
    const response: AxiosResponse<ApiResponse<TowersGameUserWithUserAndTables[]>> = await axios.get(
      `/api/tables/${tableId}/users`
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
