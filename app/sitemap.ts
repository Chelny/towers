import type { MetadataRoute } from "next";
import {
  ROUTE_ACCOUNT,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_GAMES,
  ROUTE_HOME,
  ROUTE_PRIVACY_POLICY,
  ROUTE_PROFILE,
  ROUTE_RESET_PASSWORD,
  ROUTE_SIGN_IN,
  ROUTE_SIGN_UP,
  ROUTE_TERMS_OF_SERVICE,
  ROUTE_TOWERS,
} from "@/constants/routes";
import { Language, languages } from "@/translations/languages";

const BASE_URL = process.env.BASE_URL!;

export default function sitemap(): MetadataRoute.Sitemap {
  const getLanguagesPaths = (path: string): Record<string, string> => {
    return languages
      .filter((languages: Language) => languages.locale !== "pseudo-LOCALE")
      .reduce(
        (acc: Record<string, string>, languages: Language) => {
          acc[languages.locale] = `${BASE_URL}/${languages.locale}${path}`;
          return acc;
        },
        {} as Record<string, string>,
      );
  };

  return [
    // High-priority routes
    {
      url: `${BASE_URL}${ROUTE_HOME.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 1,
      alternates: {
        languages: {
          en: `${BASE_URL}/en`,
          fr: `${BASE_URL}/fr`,
        },
      },
    },
    {
      url: `${BASE_URL}${ROUTE_SIGN_UP.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: getLanguagesPaths(ROUTE_SIGN_UP.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_SIGN_IN.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: {
        languages: getLanguagesPaths(ROUTE_SIGN_IN.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_GAMES.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: getLanguagesPaths(ROUTE_GAMES.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_TOWERS.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: getLanguagesPaths(ROUTE_TOWERS.PATH),
      },
    },

    // Medium-priority routes
    {
      url: `${BASE_URL}${ROUTE_ACCOUNT.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: getLanguagesPaths(ROUTE_ACCOUNT.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_PROFILE.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: getLanguagesPaths(ROUTE_PROFILE.PATH),
      },
    },

    // Low-priority routes
    {
      url: `${BASE_URL}${ROUTE_TERMS_OF_SERVICE.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: {
        languages: getLanguagesPaths(ROUTE_TERMS_OF_SERVICE.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_PRIVACY_POLICY.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.4,
      alternates: {
        languages: getLanguagesPaths(ROUTE_PRIVACY_POLICY.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_FORGOT_PASSWORD.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: getLanguagesPaths(ROUTE_FORGOT_PASSWORD.PATH),
      },
    },
    {
      url: `${BASE_URL}${ROUTE_RESET_PASSWORD.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: getLanguagesPaths(ROUTE_RESET_PASSWORD.PATH),
      },
    },
  ];
}
