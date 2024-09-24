import { ReactNode } from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { StoreProvider } from "@/app/store-provider"
import { SessionDataProvider } from "@/context/session-context"
import "./globals.scss"

type RootLayoutProps = {
  children: ReactNode
}

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Towers Game",
    default: "Towers Game"
  },
  description: "Arcade game based on Yahoo! Towers",
  keywords: ["Yahoo!", "Towers", "game", "Tetris", "arcade"],
  creator: "Chelny Duplan",
  authors: [{ name: "Chelny Duplan" }]
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>): ReactNode {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionDataProvider>
          <StoreProvider>{children}</StoreProvider>
        </SessionDataProvider>
      </body>
    </html>
  )
}
