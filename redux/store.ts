import { configureStore } from "@reduxjs/toolkit"
import sidebarReducer from "@/redux/features/sidebar-slice"
import socketReducer from "@/redux/features/socket-slice"
import socketMiddleware from "@/redux/middleware/socket-middleware"

export const makeStore = () => {
  return configureStore({
    reducer: {
      socket: socketReducer,
      sidebar: sidebarReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]
