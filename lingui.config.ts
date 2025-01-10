import { defineConfig } from "@lingui/cli"

export default defineConfig({
  locales: ["en", "fr", "pseudo-LOCALE"],
  pseudoLocale: "pseudo-LOCALE",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
    "pseudo-LOCALE": "en",
  },
  catalogs: [
    {
      path: "<rootDir>/translations/locales/{locale}",
      include: [
        "<rootDir>/app/",
        "<rootDir>/components/",
        "<rootDir>/constants/",
        "<rootDir>/lib/",
        "<rootDir>/redux/",
        "<rootDir>/translations/languages.ts",
        "<rootDir>/utils/",
      ],
    },
  ],
})
