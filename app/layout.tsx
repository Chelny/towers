import { PropsWithChildren, ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import { StoreProvider } from "@/app/store-provider"
import { APP_CONFIG } from "@/constants/app"
import "./globals.scss"

type RootLayoutProps = PropsWithChildren<{}>

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_CONFIG.NAME}`,
    default: APP_CONFIG.NAME,
  },
  description: "Arcade game based on Yahoo! Towers",
  applicationName: APP_CONFIG.NAME,
  keywords: ["Yahoo Towers", "Yahoo! Towers", "game", "Tetris", "arcade"],
  creator: "Chelny Duplan",
  icons: {
    icon: { rel: "icon", url: "/favicon.svg", sizes: "image/svg+xml" },
    apple: { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
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
        <StoreProvider>{children}</StoreProvider>
      </body>
      <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS!} />
    </html>
  )
}
