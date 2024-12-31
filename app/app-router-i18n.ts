import { I18n, Messages, setupI18n } from "@lingui/core"
import linguiConfig from "@/lingui.config"

const { locales } = linguiConfig
// Optionally use a stricter union type
type SupportedLocales = string

async function loadCatalog(locale: SupportedLocales): Promise<{
  [k: string]: Messages
}> {
  // Fix for "ERROR [Better Auth]: [#better-auth]: Couldn't read your auth config.
  // TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".po" for /.../towers/translations/locales/*.po"
  if (process.env.BETTER_AUTH_CLI) {
    return { [locale]: {} }
  }

  const { messages } = await import(`@/translations/locales/${locale}.po`)
  // const { messages } = await import(`@lingui/loader!@/translations/locales/${locale}.po`)
  return {
    [locale]: messages,
  }
}
const catalogs = await Promise.all(locales.map(loadCatalog))

// Transform array of catalogs into a single object
export const allMessages = catalogs.reduce((acc, oneCatalog) => {
  return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = { [K in SupportedLocales]: I18n }

export const allI18nInstances: AllI18nInstances = locales.reduce((acc, locale) => {
  const messages = allMessages[locale] ?? {}
  const i18n = setupI18n({
    locale,
    messages: { [locale]: messages },
  })
  return { ...acc, [locale]: i18n }
}, {})

export const getI18nInstance = (locale: SupportedLocales): I18n => {
  if (!allI18nInstances[locale]) {
    console.warn(`No i18n instance found for locale "${locale}"`)
  }
  return allI18nInstances[locale]! || allI18nInstances["en"]!
}
