import { NextConfig } from "next"

const nextConfig: NextConfig = {
  env: {
    PROTOCOL: process.env.PROTOCOL,
    HOSTNAME: process.env.HOSTNAME,
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
    GITLAB_CLIENT_SECRET: process.env.GITLAB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_SENDER: process.env.EMAIL_SENDER,
    EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT,
    GOOGLE_ANALYTICS: process.env.GOOGLE_ANALYTICS,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [
      "__tests__",
      "app",
      "components",
      "constants",
      "context",
      "data",
      "enums",
      "features",
      "hooks",
      "interfaces",
      "lib",
      "middleware",
      "redux",
      "utils",
    ],
  },
  experimental: {
    turbo: {
      rules: {
        "*.scss": {
          loaders: ["sass-loader"],
          as: "*.css",
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "gitlab.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net", // Twitch
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com", // Twitter/X
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  poweredByHeader: false,
  reactStrictMode: true,
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  async headers() {
    return [
      {
        source: "/api/:path((?!auth/reference).*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.BASE_URL || "*" },
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/sign-in",
        permanent: true,
      },
      {
        source: "/account",
        destination: "/account/profile",
        permanent: true,
      },
      {
        source: "/games",
        destination: "/games/towers",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
