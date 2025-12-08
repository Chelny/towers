import { AllMessages, I18n, Messages, setupI18n } from "@lingui/core";
import { logger } from "@/lib/logger";
import linguiConfig from "@/lingui.config";

const { locales } = linguiConfig;
// Optionally use a stricter union type
type SupportedLocales = string;

const loadCatalog = async (locale: SupportedLocales): Promise<Record<string, Messages>> => {
  try {
    const { messages } = await import(`@lingui/loader!@/translations/locales/${locale}/messages.po`);
    return { [locale]: messages };
  } catch (error) {
    logger.error(`Failed to load locale ${locale}: ${error}`);
    return { [locale]: {} };
  }
};

const catalogs: Record<string, Messages>[] = await Promise.all(locales.map(loadCatalog));

// Transform array of catalogs into a single object
export const allMessages: AllMessages = catalogs.reduce(
  (acc: Record<string, Messages>, oneCatalog: Record<string, Messages>) => {
    return { ...acc, ...oneCatalog };
  },
  {},
);

type AllI18nInstances = { [K in SupportedLocales]: I18n };

export const allI18nInstances: AllI18nInstances = locales.reduce((acc: {}, locale: string) => {
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

  return allI18nInstances[locale]! || allI18nInstances["en"]!;
};
