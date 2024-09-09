import { renderHook } from "@testing-library/react"
import { SessionContext } from "@/context"
import { useSessionData } from "@/hooks"
import { mockedAuthenticatedSession, mockedUnauthenticatedSession } from "@/vitest.setup"

vi.mock("@/hooks", () => ({
  useSessionData: vi.fn()
}))

describe("useSessionData Hook", () => {
  beforeEach(() => {
    vi.mocked(useSessionData).mockReturnValue(mockedUnauthenticatedSession)
  })

  it("should return session data when SessionContext provides data", () => {
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)

    const { result } = renderHook(() => useSessionData(), {
      wrapper: ({ children }) => (
        <SessionContext.Provider value={mockedAuthenticatedSession}>{children}</SessionContext.Provider>
      )
    })

    expect(result.current).toEqual(mockedAuthenticatedSession)
  })

  it("should return default session data when SessionContext is null", () => {
    const { result } = renderHook(() => useSessionData(), {
      wrapper: ({ children }) => (
        <SessionContext.Provider value={mockedUnauthenticatedSession}>{children}</SessionContext.Provider>
      )
    })

    expect(result.current).toEqual(mockedUnauthenticatedSession)
  })

  it("should throw an error if SessionContext is undefined", () => {
    const error: Error = new Error("React Context is unavailable in Server Components")

    vi.mocked(useSessionData).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useSessionData())

    expect(() => result.current).rejects.toThrow(error.message)
  })

  it("should throw an error in non-production when SessionContext is null", () => {
    const error: Error = new Error(
      "[auth-wrapper-error]: `useSessionData` must be wrapped in a <SessionDataProvider />"
    )

    vi.mocked(useSessionData).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useSessionData())

    expect(() => result.current).rejects.toThrow(error.message)
  })
})
