import { PropsWithChildren, ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { headers } from "next/headers"
import { I18n } from "@lingui/core"
import { GoogleAnalytics } from "@next/third-parties/google"
import { ThemeProvider } from "next-themes"
import { LinguiClientProvider } from "@/app/[locale]/lingui-client-provider"
import { allMessages } from "@/app/app-router-i18n"
import { initLingui } from "@/app/init-lingui"
import { StoreProvider } from "@/app/store-provider"
import { APP_CONFIG } from "@/constants/app"
import { Language, languages } from "@/translations/languages"
import "../globals.scss"

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
  const headersList = await headers()
  const nonce: string = headersList.get("x-nonce") || ""

  initLingui(routeParams.locale)

  return (
    <html lang={routeParams.locale} dir={currentLanguage?.rtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          storageKey="towers.theme"
          enableSystem
          defaultTheme="system"
          forcedTheme="light"
          nonce={nonce}
          disableTransitionOnChange
        >
          <LinguiClientProvider initialLocale={routeParams.locale} initialMessages={allMessages[routeParams.locale]}>
            <StoreProvider>{children}</StoreProvider>
          </LinguiClientProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS!} nonce={nonce} />
    </html>
  )
}
