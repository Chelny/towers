import { AllMessages, I18n, Messages, setupI18n } from "@lingui/core";
import { logger } from "@/lib/logger";
import linguiConfig from "@/lingui.config";
import { messages as enMessages } from "@/translations/locales/en/messages";
import { messages as frMessages } from "@/translations/locales/fr/messages";
import { messages as pseudoLocaleMessages } from "@/translations/locales/pseudo-LOCALE/messages";

const { locales } = linguiConfig;

export const allMessages: AllMessages = {
  en: enMessages,
  fr: frMessages,
  "pseudo-LOCALE": pseudoLocaleMessages,
};

type SupportedLocales = keyof typeof allMessages;
type AllI18nInstances = { [K in SupportedLocales]: I18n };

const allI18nInstances: AllI18nInstances = locales.reduce((acc: {}, locale: string) => {
  const messages: Messages = allMessages[locale] ?? {};
  const i18n: I18n = setupI18n({
    locale,
    messages: { [locale]: messages },
  });

  return { ...acc, [locale]: i18n };
}, {});

export const getI18nInstance = (locale: SupportedLocales): I18n => {
  if (!allI18nInstances[locale]) {
    logger.warn(`No i18n instance found for locale "${locale}"`);
  }

  return allI18nInstances[locale] || allI18nInstances["en"];
};
