import type { ReactElement } from "react"

export type AuthProvider = "discord" | "facebook" | "github" | "gitlab" | "google" | "twitch" | "twitter"

export type AuthProviderDetails = {
  name: AuthProvider
  label: string
  icon: ReactElement
}
