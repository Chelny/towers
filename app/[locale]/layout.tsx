import { PropsWithChildren, ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { I18n } from "@lingui/core"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ThemeProvider } from "next-themes"
import { LinguiClientProvider } from "@/app/[locale]/lingui-client-provider"
import { allMessages } from "@/app/app-router-i18n"
import "@/app/globals.scss"
import { initLingui } from "@/app/init-lingui"
import { APP_CONFIG, APP_COOKIES } from "@/constants/app"
import { GameProvider } from "@/context/GameContext"
import { ModalProvider } from "@/context/ModalContext"
import { SocketProvider } from "@/context/SocketContext"
import { Language, languages } from "@/translations/languages"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

type RootLayoutProps = PropsWithChildren<{
  params: Promise<Params>
  breadcrumb: ReactNode
}>

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const routeParams: Params = await params
  const i18n: I18n = initLingui(routeParams.locale)

  return {
    title: {
      template: `%s | ${APP_CONFIG.NAME}`,
      default: APP_CONFIG.NAME,
    },
    description: i18n._("Arcade game based on Yahoo! Towers"),
    applicationName: APP_CONFIG.NAME,
    keywords: ["Yahoo Towers", "Yahoo! Towers", "game", "Tetris", "arcade"],
    creator: "Chelny Duplan",
    icons: {
      icon: { rel: "icon", url: "/favicon.svg", sizes: "image/svg+xml" },
      apple: { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    },
  }
}

export default async function RootLayout({ children, params }: Readonly<RootLayoutProps>): Promise<ReactNode> {
  const routeParams: Params = await params
  const currentLanguage: Language | undefined = languages.find(
    (language: Language) => language.locale === routeParams.locale,
  )
  const headersList: ReadonlyHeaders = await headers()
  const nonce: string = headersList.get("x-nonce") || ""

  initLingui(routeParams.locale)

  return (
    <html lang={routeParams.locale} dir={currentLanguage?.rtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          storageKey={APP_COOKIES.THEME}
          enableSystem
          defaultTheme="system"
          forcedTheme="light"
          nonce={nonce}
          disableTransitionOnChange
        >
          <LinguiClientProvider initialLocale={routeParams.locale} initialMessages={allMessages[routeParams.locale]}>
            <SocketProvider>
              <GameProvider>
                <ModalProvider>{children}</ModalProvider>
              </GameProvider>
            </SocketProvider>
          </LinguiClientProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS!} nonce={nonce} />
    </html>
  )
}
