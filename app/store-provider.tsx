"use client"

import { ReactNode, useRef } from "react"
import { Provider } from "react-redux"
import { AppStore, makeStore } from "@/redux/store"

type ReduxProviderProps = {
  children: ReactNode
}

export const StoreProvider = ({ children }: ReduxProviderProps): ReactNode => {
  const storeRef = useRef<AppStore>()

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
