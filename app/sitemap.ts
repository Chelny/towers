import type { MetadataRoute } from "next"
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
} from "@/constants/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl: string = process.env.BASE_URL!

  return [
    // High-priority routes
    {
      url: `${baseUrl}${ROUTE_HOME.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${baseUrl}${ROUTE_SIGN_UP.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTE_SIGN_IN.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTE_GAMES.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTE_TOWERS.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Medium-priority routes
    {
      url: `${baseUrl}${ROUTE_ACCOUNT.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${ROUTE_PROFILE.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // Low-priority routes
    {
      url: `${baseUrl}${ROUTE_TERMS_OF_SERVICE.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTE_PRIVACY_POLICY.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${ROUTE_FORGOT_PASSWORD.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}${ROUTE_RESET_PASSWORD.PATH}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
