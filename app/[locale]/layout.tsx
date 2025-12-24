import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { I18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "next-themes";
import { LinguiClientProvider } from "@/app/[locale]/lingui-client-provider";
import { allMessages, getI18nInstance } from "@/app/app-router-i18n";
import { initLingui } from "@/app/init-lingui";
import { APP_CONFIG, APP_STORAGE_KEYS } from "@/constants/app";
import { ConversationsProvider } from "@/context/ConversationsContext";
import { GameProvider } from "@/context/GameContext";
import { ModalProvider } from "@/context/ModalContext";
import { SocketProvider } from "@/context/SocketContext";
import { ToastProvider } from "@/context/ToastContext";
import { auth } from "@/lib/auth";
import { Session } from "@/lib/auth-client";
import linguiConfig from "@/lingui.config";
import { Language, languages } from "@/translations/languages";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

type RootLayoutProps = LayoutProps<"/[locale]">;

export async function generateStaticParams(): Promise<{ locale: string }[]> {
  return linguiConfig.locales.map((locale: string) => ({ locale }));
}

export async function generateMetadata({ params }: RootLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n: I18n = getI18nInstance(locale);

  return {
    title: {
      template: `%s | ${APP_CONFIG.NAME}`,
      default: APP_CONFIG.NAME,
    },
    description: i18n._(msg`Arcade game based on Yahoo! Towers`),
    applicationName: APP_CONFIG.NAME,
    keywords: ["Yahoo Towers", "Yahoo! Towers", "game", "Tetris", "arcade"],
    creator: "Chelny Duplan",
    icons: {
      icon: { rel: "icon", url: "/favicon.svg", sizes: "image/svg+xml" },
      apple: { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    },
  };
}

export default async function RootLayout({ children, params }: Readonly<RootLayoutProps>): Promise<ReactNode> {
  const { locale } = await params;
  const currentLanguage: Language | undefined = languages.find((language: Language) => language.locale === locale);
  const headersList: ReadonlyHeaders = await headers();
  const nonce: string | undefined = headersList.get("x-nonce") || undefined;
  const session: Session | null = await auth.api.getSession({ headers: headersList });

  initLingui(locale);

  return (
    <html lang={locale} dir={currentLanguage?.rtl ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          storageKey={APP_STORAGE_KEYS.THEME}
          enableSystem
          nonce={nonce}
          disableTransitionOnChange
        >
          <LinguiClientProvider initialLocale={locale} initialMessages={allMessages[locale]}>
            <SocketProvider session={session}>
              <GameProvider>
                <ToastProvider>
                  <ConversationsProvider>
                    <ModalProvider>{children}</ModalProvider>
                  </ConversationsProvider>
                </ToastProvider>
              </GameProvider>
            </SocketProvider>
          </LinguiClientProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS!} nonce={nonce} />
    </html>
  );
}
