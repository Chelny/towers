import pkg from "@next/env"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const { loadEnvConfig } = pkg

loadEnvConfig(process.cwd())

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern",
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    server: {
      deps: {
        inline: ["next"],
      },
    },
    setupFiles: ["vitest.setup.ts"],
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  },
})
