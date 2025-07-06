import pkg from "@next/env"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

const { loadEnvConfig } = pkg

loadEnvConfig(process.cwd())

export default defineConfig({
  assetsInclude: ["**/*.po"],
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
    setupFiles: ["vitest.setup.ts", "test/utils/lingui.tsx"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
  },
})
