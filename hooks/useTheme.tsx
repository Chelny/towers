import { useEffect } from "react"
import { WebsiteTheme } from "@prisma/client"

export function useTheme(sessionTheme: WebsiteTheme | undefined) {
  useEffect(() => {
    const userTheme: WebsiteTheme | undefined = sessionTheme
    if (!userTheme) return

    const root: HTMLElement = document.documentElement

    const applyTheme = (): void => {
      if (userTheme === WebsiteTheme.LIGHT) {
        root.classList.remove("dark")
        root.classList.add("light")
      } else if (userTheme === WebsiteTheme.DARK) {
        root.classList.remove("light")
        root.classList.add("dark")
      } else {
        const isDark: boolean = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.classList.remove(isDark ? "light" : "dark")
        root.classList.add(isDark ? "dark" : "light")
      }
    }

    applyTheme()

    if (!userTheme || userTheme === WebsiteTheme.SYSTEM) {
      const media: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (): void => applyTheme()
      media.addEventListener("change", handler)

      return () => media.removeEventListener("change", handler)
    }
  }, [sessionTheme])
}
