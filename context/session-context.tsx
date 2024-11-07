"use client"

import React, { Context, createContext, type PropsWithChildren, ReactNode, useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import axios, { AxiosRequestConfig, AxiosResponse } from "axios"
import { getCsrfToken } from "next-auth/react"
import { getAxiosError } from "@/utils/api"
import type { Session } from "next-auth"

type TSessionProviderProps = PropsWithChildren<{
  session?: Session | null
}>

/**
 * Type of the returned Provider elements with data which contains session data, status that shows the state of the Provider, and update which is the function to update session data
 */
type TSessionStatus = "authenticated" | "loading" | "unauthenticated"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TUpdateSessionData = { [key: string]: any }
type TUpdateSession = (data?: TUpdateSessionData) => Promise<Session | null | undefined>
export type TSessionContextValue = { data: Session | null; status: TSessionStatus; update: TUpdateSession }

/**
 * React context to keep session through renders
 */
export const SessionContext: Context<TSessionContextValue | undefined> = createContext?.<
  TSessionContextValue | undefined
>(undefined)

export const SessionDataProvider = ({ session: initialSession = null, children }: TSessionProviderProps): ReactNode => {
  const pathname: string = usePathname()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState<boolean>(!initialSession)

  useEffect(() => {
    const fetchSession = async (): Promise<void> => {
      if (!initialSession) {
        try {
          // Retrive data from session callback
          const response: AxiosResponse = await axios.get("/api/auth/session")
          const fetchedSession: Session | null = response.data

          setSession(fetchedSession)
        } catch (error) {
          getAxiosError(error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchSession().finally()
  }, [initialSession, pathname])

  const sessionData: TSessionContextValue = useMemo(
    () => ({
      data: session,
      status: loading ? "loading" : session ? "authenticated" : "unauthenticated",
      async update(data?: TUpdateSessionData) {
        if (loading || !session) return

        setLoading(true)

        const fetchOptions: AxiosRequestConfig = {
          headers: {
            "Content-Type": "application/json"
          }
        }

        if (data) {
          fetchOptions.method = "POST"
          // That is possible to replace getCsrfToken with a fetch to /api/auth/csrf
          fetchOptions.data = { csrfToken: await getCsrfToken(), data }
        }

        try {
          const fetchedSessionResponse = await axios("/api/auth/session", fetchOptions)
          let fetchedSession: Session | null = null

          if (fetchedSessionResponse.status === 200) {
            fetchedSession = fetchedSessionResponse.data
            setSession(fetchedSession)
            setLoading(false)
          }

          return fetchedSession
        } catch (error) {
          getAxiosError(error)
        } finally {
          setLoading(false)
        }
      }
    }),
    [loading, session]
  )

  return <SessionContext.Provider value={sessionData}>{children}</SessionContext.Provider>
}
