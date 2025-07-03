import plugin from "tailwindcss/plugin"
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        dark: {
          background: "#1E2A35",
          text: "#E1E8ED",
          "text-muted": "#AAB8C2",

          "card-background": "#2B3A48",
          "card-border": "#3A4A58",

          "input-background": "#243342",
          "input-text": "#F0F4F8",
          "input-readonly-background": "#2B3A48",
          "input-readonly-text": "#AEBECC",
          "input-disabled-background": "#202E3A",
          "input-disabled-text": "#7D8C9A",
          "input-border-top": "#1A2630",
          "input-border-end": "#365066",
          "input-border-bottom": "#365066",
          "input-border-start": "#1A2630",

          "button-background": "#3D5A73",
          "button-text": "#F0F4F8",
          "button-border-top": "#5E7689",
          "button-border-end": "#1C2A34",
          "button-border-bottom": "#1C2A34",
          "button-border-start": "#5E7689",
          "button-ring": "#5AA1C2",

          "modal-background": "#2B3A48",
          "modal-border": "#3A4A58",
          "modal-heading-text": "#F0F4F8",
          "modal-body-text": "#E1E8ED",

          "info-background": "#2E4356",
          "info-text": "#9BC4E2",
          "info-border": "#3A4A58",
          "warning-background": "#4C3A1A",
          "warning-text": "#E3D48C",
          "warning-border": "#70502C",
          "success-background": "#274037",
          "success-text": "#A7D9BA",
          "success-border": "#355A47",
          "error-background": "#5A2A33",
          "error-text": "#E7BFC2",
          "error-border": "#803843",
          "alert-message-background": "#2B3A48",
          "alert-message-text": "#F0F4F8",
          "alert-message-border": "#3A4A58",

          "game-background": "#22303E",
          "game-border": "#365066",
          "game-sidebar-background": "#202D3A",
          "game-sidebar-border": "#E1E8ED",
          "game-content-background": "#243342",
          "game-content-text": "#3A4A58",
          "game-content-border": "#415A6B",
          "game-orange-top-bar-background": "#FF9F40",
          "game-yellow-sub-bar-background": "#E6C744",
          "game-chat-background": "#263544",
          "game-players-header": "#2B3A48",
          "game-players-row-odd": "#263544",
          "game-players-row-even": "#243342",
          "game-players-border": "#365066",
          "game-change-keys-background": "#202D3B",
        },
      },
      gridTemplateRows: {
        game: "max-content 1fr max-content",
        "game-content": "auto minmax(25%, 35%)",
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
        "demo-block": "28px",
      },
      height: {
        fill: "-webkit-fill-available",
        "grid-cell": "calc(var(--grid-cell-size) * 1px)",
        "grid-cell-opponent": "calc(var(--grid-cell-size-opponent) * 1px)",
        "preview-piece": "calc(var(--grid-cell-size) * 3px + 16px)",
        "power-bar": "calc(var(--grid-cell-size) * 8px + 16px)",
        "demo-block": "28px",
      },
      backgroundColor: {
        "towers-primary": "theme('colors.teal.800')",
      },
      fontSize: {
        "board-button": "clamp(10px, 4vw, 16px)",
        "board-button-opponent": "clamp(6px, 4vw, 10px)",
      },
      lineHeight: {
        default: "1",
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
        "move-down": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "demo-slide-power-block": {
          "0%": { width: "1rem", transform: "scale(0.6)translate(0, 0)", opacity: "0" },
          "100%": { width: "1.5rem", transform: "scale(1) translate(calc(100% * 3), -100%)", opacity: "1" },
        },
        "demo-slide-power-block-rtl": {
          "0%": { width: "1rem", transform: "scale(0.6)translate(0, 0)", opacity: "0" },
          "100%": { width: "1.5rem", transform: "scale(1) translate(calc(-100% * 3), -100%)", opacity: "1" },
        },
      },
      animation: {
        "move-background": "move-background 180s linear infinite",
        "move-up": "move-up 1.5s ease-in-out forwards",
        "move-down": "move-down 1.5s ease-in-out forwards",
        "demo-slide-power-block": "demo-slide-power-block 0.8s ease-in-out forwards",
        "demo-slide-power-block-rtl": "demo-slide-power-block-rtl 0.4s ease-out forwards",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".towers-game-bg::before": {
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
        },
      })
    }),
  ],
}
export default config
