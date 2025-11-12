import { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS?.split(";") || [],
  // compiler: {
  //   removeConsole: {
  //     exclude: ["warn"],
  //   },
  // },
  env: {
    PROTOCOL: process.env.PROTOCOL,
    HOSTNAME: process.env.HOSTNAME,
    PORT: process.env.PORT,
    BASE_URL: process.env.BASE_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_SENDER: process.env.EMAIL_SENDER,
    EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT,
    GOOGLE_ANALYTICS: process.env.GOOGLE_ANALYTICS,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [
      "app",
      "components",
      "constants",
      "context",
      "data",
      "enums",
      "hooks",
      "interfaces",
      "lib",
      "test",
      "translations",
      "utils",
    ],
  },
  experimental: {
    serverSourceMaps: false,
    swcPlugins: [["@lingui/swc-plugin", {}]],
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
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
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
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  redirects: async () => {
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
    ];
  },
  serverExternalPackages: ["pino", "pino-pretty"],
  turbopack: {
    rules: {
      "*.po": {
        loaders: ["@lingui/loader"],
        as: "*.ts",
      },
    },
  },
  webpack: (config, { isServer }) => {
    config.cache = false;
    config.module.rules.push({
      test: /\.po$/,
      use: ["@lingui/loader"],
    });

    // Don’t bundle "socket.io-client" into the server build, just require it at runtime
    if (isServer) {
      config.externals = [...config.externals, "socket.io-client"];
    }

    return config;
  },
};

export default nextConfig;
