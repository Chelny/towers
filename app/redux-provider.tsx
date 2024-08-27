"use client"

import { ReactNode } from "react"
import { Provider } from "react-redux"
import store from "@/redux"

type ReduxProviderProps = {
  children: ReactNode
}

export const ReduxProvider = ({ children }: ReduxProviderProps): ReactNode => {
  return <Provider store={store}>{children}</Provider>
}
