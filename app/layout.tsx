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
    default: "Towers Game",
  },
  description: "Arcade game based on Yahoo! Towers",
  applicationName: "Towers",
  keywords: ["Yahoo!", "Towers", "game", "Tetris", "arcade"],
  creator: "Chelny Duplan",
  icons: {
    icon: [
      { rel: "icon", url: "/favicon.ico?v=1", sizes: "any" },
      { rel: "icon", url: "/favicon-120x120.png", sizes: "120x120", type: "image/png" },
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { rel: "apple-touch-icon", url: "/apple-touch-icon-120x120.png", sizes: "120x120" },
      { rel: "apple-touch-icon-precomposed", url: "/apple-touch-icon-precomposed.png", sizes: "120x120" },
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon-precomposed", url: "/apple-touch-icon-precomposed.png" },
    ],
  },
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
