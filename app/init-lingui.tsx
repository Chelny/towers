import { I18n } from "@lingui/core"
import { setI18n } from "@lingui/react/server"
import { getI18nInstance } from "@/app/app-router-i18n"

export function initLingui(locale: string): I18n {
  const i18n: I18n = getI18nInstance(locale) // Get a ready-made i18n instance for the given locale
  setI18n(i18n) // Make it available server-side for the current request
  return i18n
}
