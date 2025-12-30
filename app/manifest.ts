import type { MetadataRoute } from "next";
import { APP_CONFIG } from "@/constants/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_CONFIG.NAME,
    short_name: APP_CONFIG.NAME_SHORT,
    description: "A modern recreation of the classic online block-stacking puzzle game",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
