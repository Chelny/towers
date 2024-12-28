import pkg from "@next/env"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const { loadEnvConfig } = pkg

loadEnvConfig(process.cwd())

export default defineConfig({
  assetsInclude: ["**/*.po"],
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
    setupFiles: ["vitest.setup.ts", "__mocks__/utils/lingui.tsx"],
    include: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  },
})
