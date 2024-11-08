import { NextConfig } from "next"

const nextConfig: NextConfig = {
  env: {
    PROTOCOL: process.env.PROTOCOL,
    HOSTNAME: process.env.HOSTNAME,
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_DATABASE_URL: process.env.DIRECT_DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_SENDER: process.env.EMAIL_SENDER,
    EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT,
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
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
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
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.BASE_URL || "http://localhost:3000" },
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
        source: "/games",
        destination: "/games/towers",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
