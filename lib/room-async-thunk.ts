import { createAsyncThunk } from "@reduxjs/toolkit"
import { ROOM_CACHE_TAG, ROOM_CHAT_CACHE_TAG, ROOM_USERS_CACHE_TAG } from "@/constants"
import { RoomChatResponseData, RoomResponseData, RoomUsersResponseData } from "@/interfaces"

export const fetchRoomData = createAsyncThunk<RoomResponseData, string, { rejectValue: string }>(
  "socket/fetchRoomData",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, { cache: "no-store", next: { tags: [ROOM_CACHE_TAG] } })
      if (!response.ok) throw new Error("Failed to fetch room data")
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to fetch room data")
    }
  }
)

export const fetchRoomChatData = createAsyncThunk<RoomChatResponseData, string, { rejectValue: string }>(
  "socket/fetchRoomChatData",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/room-chat/${roomId}`, {
        cache: "no-store",
        next: { tags: [ROOM_CHAT_CACHE_TAG] }
      })
      if (!response.ok) throw new Error("Failed to fetch room chat data")
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to fetch room chat data")
    }
  }
)

export const fetchRoomUsersData = createAsyncThunk<RoomUsersResponseData, string, { rejectValue: string }>(
  "socket/fetchRoomUsersData",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/towers-users?roomId=${roomId}`, {
        cache: "no-store",
        next: { tags: [ROOM_USERS_CACHE_TAG] }
      })
      if (!response.ok) throw new Error("Failed to fetch room users data")
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error(error)
      return rejectWithValue("Failed to fetch room users data")
    }
  }
)
