"use client";

import { ReactNode, useState } from "react";
import { I18n, type Messages, setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";

export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: ReactNode
  initialLocale: string
  initialMessages: Messages
}) {
  const [i18n] = useState<I18n>(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    });
  });

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
