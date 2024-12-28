import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/apple-touch-icon-120x120.png",
          "/apple-touch-icon-precomposed.png",
          "/apple-touch-icon-120x120-precomposed.png",
          "/api",
          "/account",
          "/games",
        ],
        allow: "/",
      },
    ],
    sitemap: `${process.env.BASE_URL}/sitemap.xml`,
  }
}
