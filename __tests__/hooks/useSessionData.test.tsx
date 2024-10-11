import { renderHook } from "@testing-library/react"
import { mockAuthenticatedSession, mockUnauthenticatedSession } from "@/__mocks__/data/users"
import { SessionContext } from "@/context/session-context"
import { useSessionData } from "@/hooks/useSessionData"

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("useSessionData Hook", () => {
  beforeEach(() => {
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)
  })

  it("should return session data when SessionContext provides data", () => {
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)

    const { result } = renderHook(() => useSessionData(), {
      wrapper: ({ children }) => (
        <SessionContext.Provider value={mockAuthenticatedSession}>{children}</SessionContext.Provider>
      )
    })

    expect(result.current).toEqual(mockAuthenticatedSession)
  })

  it("should return default session data when SessionContext is null", () => {
    const { result } = renderHook(() => useSessionData(), {
      wrapper: ({ children }) => (
        <SessionContext.Provider value={mockUnauthenticatedSession}>{children}</SessionContext.Provider>
      )
    })

    expect(result.current).toEqual(mockUnauthenticatedSession)
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
