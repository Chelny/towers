import { PropsWithChildren, ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { StoreProvider } from "@/app/store-provider"
import { APP_NAME } from "@/constants/app"
import { SessionDataProvider } from "@/context/session-context"
import "./globals.scss"

type RootLayoutProps = PropsWithChildren<{}>

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Towers Game",
    default: "Towers Game",
  },
  description: "Arcade game based on Yahoo! Towers",
  applicationName: APP_NAME,
  keywords: ["Yahoo Towers", "Yahoo! Towers", "game", "Tetris", "arcade"],
  creator: "Chelny Duplan",
  icons: {
    icon: { rel: "icon", url: "/favicon.ico", sizes: "16x16", type: "image/vnd.microsoft.icon" },
    apple: { rel: "apple-touch-icon", url: "/images/icons/apple-touch-icon.png", sizes: "180x180" },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
