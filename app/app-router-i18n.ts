import { AllMessages, I18n, Messages, setupI18n } from "@lingui/core"
import linguiConfig from "@/lingui.config"

const { locales } = linguiConfig
// Optionally use a stricter union type
type SupportedLocales = string

async function loadCatalog(locale: SupportedLocales): Promise<Record<string, Messages>> {
  try {
    // TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".po" for /.../towers/translations/locales/*.po"
    if (process.env.BYPASS_LINGUI_ERRORS) {
      throw new Error("ERR_UNKNOWN_FILE_EXTENSION")
    }

    const { messages } = await import(`@/translations/locales/${locale}.po`)
    // const { messages } = await import(`@lingui/loader!@/translations/locales/${locale}.po`)
    return { [locale]: messages }
  } catch (error) {
    console.error(`Failed to load locale ${locale}: ${error}`)
    return { [locale]: {} }
  }
}

const catalogs: Record<string, Messages>[] = await Promise.all(locales.map(loadCatalog))

// Transform array of catalogs into a single object
export const allMessages: AllMessages = catalogs.reduce((acc, oneCatalog) => {
  return { ...acc, ...oneCatalog }
}, {})

type AllI18nInstances = { [K in SupportedLocales]: I18n }

export const allI18nInstances: AllI18nInstances = locales.reduce((acc, locale) => {
  const messages: Messages = allMessages[locale] ?? {}
  const i18n: I18n = setupI18n({
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
