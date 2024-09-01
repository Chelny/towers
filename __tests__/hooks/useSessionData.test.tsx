import { Context, createContext } from "react"
import React from "react"
import { renderHook } from "@testing-library/react"
import { Mock } from "vitest"
import { SessionContext, type TSessionContextValue } from "@/context"
import { useSessionData } from "@/hooks"

vi.mock("@/hooks", () => ({
  useSessionData: vi.fn()
}))

describe("useSessionData Hook", () => {
  beforeEach(() => {
    vi.mocked(useSessionData).mockReturnValue({
      status: "unauthenticated",
      data: null,
      update: vi.fn()
    })
  })

  it("should return session data when SessionContext provides data", () => {
    const mockSessionData: TSessionContextValue = {
      data: { user: { name: "John Doe" }, expires: "2024-09-01T00:00:00Z" },
      status: "authenticated",
      update: vi.fn()
    }

    vi.mocked(useSessionData).mockReturnValue(mockSessionData)

    const { result } = renderHook(() => useSessionData(), {
      wrapper: ({ children }) => <SessionContext.Provider value={mockSessionData}>{children}</SessionContext.Provider>
    })

    expect(result.current).toEqual(mockSessionData)
  })

  it("should return default session data when SessionContext is null", () => {
    const { result } = renderHook(() => useSessionData(), {
      wrapper: ({ children }) => (
        <SessionContext.Provider value={{ data: null, status: "unauthenticated", update: vi.fn() }}>
          {children}
        </SessionContext.Provider>
      )
    })

    expect(result.current).toEqual({
      data: null,
      status: "unauthenticated",
      update: expect.any(Function)
    })
  })

  it("should throw an error if SessionContext is undefined", () => {
    const error = new Error("React Context is unavailable in Server Components")

    vi.mocked(useSessionData).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useSessionData())

    expect(() => result.current).rejects.toThrow(error.message)
  })

  it("should throw an error in non-production when SessionContext is null", () => {
    const error = new Error("[auth-wrapper-error]: `useSessionData` must be wrapped in a <SessionDataProvider />")

    vi.mocked(useSessionData).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useSessionData())

    expect(() => result.current).rejects.toThrow(error.message)
  })
})
