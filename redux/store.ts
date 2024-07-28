import { configureStore } from "@reduxjs/toolkit"
import socketReducer from "@/features"
import socketMiddleware from "@/middleware/socket-middleware"

const store = configureStore({
  reducer: {
    socket: socketReducer
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(socketMiddleware)
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
