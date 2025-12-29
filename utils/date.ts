import type { I18n } from "@lingui/core";

export const createDateFormatter = (
  i18n: I18n,
  options: Intl.DateTimeFormatOptions,
): ((date: Date | string | number) => string) => {
  const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(i18n.locale, options);
  return (date: Date | string | number) => formatter.format(date instanceof Date ? date : new Date(date));
};
