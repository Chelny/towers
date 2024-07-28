import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true
    },
    extend: {
      gridTemplateRows: {
        table: "max-content 2fr minmax(0, 1fr)",
        "table-team": "repeat(6, max-content)",
        "grid-container": "repeat(var(--grid-rows), calc(var(--grid-cell-size) * 1px))",
        "grid-container-opponent": "repeat(var(--grid-rows), calc(var(--grid-cell-size-opponent) * 1px))"
      },
      gridTemplateColumns: {
        table: "max-content repeat(2, 1fr)",
        "table-team": "224px 1fr 224px", // player-board-opponent * 2
        "grid-row": "repeat(var(--grid-cols), calc(var(--grid-cell-size) * 1px))",
        "grid-row-opponent": "repeat(var(--grid-cols), calc(var(--grid-cell-size-opponent) * 1px))"
      },
      gridTemplateAreas: {
        table: ["banner banner banner", "sidebar game game", "sidebar chat chat"],
        "board-container": ["preview-piece grid-container", "power-bar grid-container"],
        "board-container-reversed": ["grid-container preview-piece", "grid-container power-bar"],
        "board-container-opponent": ["grid-container", "grid-container"]
      },
      width: {
        fill: "-webkit-fill-available",
        "player-board-opponent": "calc((var(--grid-cell-size-opponent) * var(--grid-cols) * 1px) + 8px + 2px)", // 8px and 2px are border thickness
        "grid-container": "calc(var(--grid-cols) * var(--grid-cell-size) * 1px)",
        "grid-container-opponent": "calc(var(--grid-cols) * var(--grid-cell-size-opponent) * 1px)",
        "grid-cell": "calc(var(--grid-cell-size) * 1px)",
        "grid-cell-opponent": "calc(var(--grid-cell-size-opponent) * 1px)",
        "preview-block": "calc(var(--grid-cell-size) * 1px + 16px)",
        "power-bar": "calc(var(--grid-cell-size) * 1px + 16px)"
      },
      height: {
        fill: "-webkit-fill-available",
        "grid-cell": "calc(var(--grid-cell-size) * 1px)",
        "grid-cell-opponent": "calc(var(--grid-cell-size-opponent) * 1px)",
        "preview-block": "calc(var(--grid-cell-size) * 3px + 16px)",
        "power-bar": "calc(var(--grid-cell-size) * 8px + 16px)"
      },
      colors: {
        "custom-neutral": {
          100: "var(--color-custom-neutral-100)",
          200: "var(--color-custom-neutral-200)",
          300: "var(--color-custom-neutral-300)",
          400: "var(--color-custom-neutral-400)"
        },
        "custom-blue": {
          100: "var(--color-custom-blue-100)",
          200: "var(--color-custom-blue-200)",
          300: "var(--color-custom-blue-300)",
          400: "var(--color-custom-blue-400)",
          500: "var(--color-custom-blue-500)",
          600: "var(--color-custom-blue-600)",
          700: "var(--color-custom-blue-700)",
          800: "var(--color-custom-blue-800)",
          900: "var(--color-custom-blue-900)",
          1000: "var(--color-custom-blue-1000)"
        },
        "custom-green": {
          100: "var(--color-custom-green-100)"
        },
        "custom-orange": {
          100: "var(--color-custom-orange-100)"
        }
      },
      keyframes: {
        "move-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        }
      },
      animation: {
        "move-up": "move-up 1.5s ease-in-out forwards"
      }
    }
  },
  plugins: [require("@savvywombat/tailwindcss-grid-areas")]
}
export default config
