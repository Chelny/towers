import { WebsiteTheme } from "@prisma/client"
import { renderHook } from "@testing-library/react"
import { Mock } from "vitest"
import { useTheme } from "./useTheme"

describe("useTheme", () => {
  beforeEach(() => {
    document.documentElement.className = ""
  })

  it("should apply light class for LIGHT theme", () => {
    renderHook(() => useTheme(WebsiteTheme.LIGHT))
    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("should apply dark class for DARK theme", () => {
    renderHook(() => useTheme(WebsiteTheme.DARK))
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
  })

  it("should apply system preference class (light)", () => {
    const matchMedia: Mock = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal("matchMedia", matchMedia)

    renderHook(() => useTheme(WebsiteTheme.SYSTEM))

    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("dark")).toBe(false)
  })

  it("should apply system preference class (dark)", () => {
    const matchMedia: Mock = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
    vi.stubGlobal("matchMedia", matchMedia)

    renderHook(() => useTheme(WebsiteTheme.SYSTEM))

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("light")).toBe(false)
  })
})
