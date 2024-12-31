import { i18n, MessageDescriptor } from "@lingui/core"
import { msg } from "@lingui/core/macro"
import { enUS, frCA, Locale } from "date-fns/locale"

export interface Language {
  locale: string
  msg: MessageDescriptor
  flag?: string
  territory?: string
  rtl: boolean
}

export type SupportedLocales = "en" | "fr" | "pseudo-LOCALE"
export const defaultLocale: SupportedLocales = "en"

// date-fns
export const enLocale: Locale = enUS
export const frLocale: Locale = frCA

export const languages: Language[] = [
  {
    locale: "en",
    msg: msg`English`,
    territory: "US",
    flag: "🇺🇸",
    rtl: false,
  },
  {
    locale: "fr",
    msg: msg`French`,
    territory: "CA",
    flag: "🇨🇦",
    rtl: false,
  },
]

if (process.env.NODE_ENV !== "production") {
  // Pseudo locale for testing
  languages.push({
    locale: "pseudo-LOCALE",
    msg: msg`Pseudo`,
    flag: "🔤",
    rtl: true,
  })
}
