import plugin from "tailwindcss/plugin"
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
    },
    extend: {
      gridTemplateRows: {
        game: "max-content 1fr max-content",
        "game-content": "auto minmax(25%, 35%)",
        "table-team": "repeat(6, max-content)",
        "grid-container": "repeat(var(--grid-rows), calc(var(--grid-cell-size) * 1px))",
        "grid-container-opponent": "repeat(var(--grid-rows), calc(var(--grid-cell-size-opponent) * 1px))",
      },
      gridTemplateColumns: {
        game: "208px 1fr max-content",
        "table-team": "224px 1fr 224px", // player-board-opponent * 2
        "grid-row": "repeat(var(--grid-cols), calc(var(--grid-cell-size) * 1px))",
        "grid-row-opponent": "repeat(var(--grid-cols), calc(var(--grid-cell-size-opponent) * 1px))",
      },
      width: {
        fill: "-webkit-fill-available",
        "player-board-opponent": "calc((var(--grid-cell-size-opponent) * var(--grid-cols) * 1px) + 8px + 2px)", // 8px and 2px are border thickness
        "grid-container": "calc(var(--grid-cols) * var(--grid-cell-size) * 1px)",
        "grid-container-opponent": "calc(var(--grid-cols) * var(--grid-cell-size-opponent) * 1px)",
        "grid-cell": "calc(var(--grid-cell-size) * 1px)",
        "grid-cell-opponent": "calc(var(--grid-cell-size-opponent) * 1px)",
        "preview-piece": "calc(var(--grid-cell-size) * 1px + 16px)",
        "power-bar": "calc(var(--grid-cell-size) * 1px + 16px)",
      },
      height: {
        fill: "-webkit-fill-available",
        "grid-cell": "calc(var(--grid-cell-size) * 1px)",
        "grid-cell-opponent": "calc(var(--grid-cell-size-opponent) * 1px)",
        "preview-piece": "calc(var(--grid-cell-size) * 3px + 16px)",
        "power-bar": "calc(var(--grid-cell-size) * 8px + 16px)",
      },
      backgroundColor: {
        "towers-primary": "theme('colors.teal.800')",
      },
      keyframes: {
        "move-background": {
          "0%": { backgroundPosition: "bottom" },
          "100%": { backgroundPosition: "top" },
        },
        "move-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "move-background": "move-background 180s linear infinite",
        "move-up": "move-up 1.5s ease-in-out forwards",
      },
      screens: {
        short: { raw: "(max-height: 991px)" },
        tall: { raw: "(min-height: 992px)" },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".towers-bg-animate::before": {
          content: "' '",
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          padding: "1rem",
          backgroundClip: "content-box",
          backgroundOrigin: "content-box",
          backgroundRepeat: "round",
          backgroundSize: "auto",
          backgroundImage: "url('/images/logo.png')",
          opacity: "0.5",
          transform: "rotate(-12deg)",
          animation: "move-background 180s linear infinite",
        },
      })
    }),
  ],
}
export default config
