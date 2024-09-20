import { configureStore } from "@reduxjs/toolkit"
import socketReducer from "@/redux/features/socket-slice"
import socketMiddleware from "@/redux/middleware"

const store = configureStore({
  reducer: {
    socket: socketReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
