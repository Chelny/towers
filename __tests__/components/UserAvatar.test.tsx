import { render, screen } from "@testing-library/react"
import { mockAuthenticatedSession, mockLoadingSession, mockUnauthenticatedSession } from "@/__mocks__/data/users"
import UserAvatar from "@/components/UserAvatar"
import { useSessionData } from "@/hooks/useSessionData"

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("UserAvatar Component", () => {
  it("should render placeholder avatar when session data is not available", () => {
    vi.mocked(useSessionData).mockReturnValue(mockLoadingSession)

    render(<UserAvatar />)

    const placeholder: HTMLImageElement = screen.getByRole("img")
    expect(placeholder).toBeInTheDocument()
  })

  it("should handle missing session user correctly", () => {
    vi.mocked(useSessionData).mockReturnValue(mockUnauthenticatedSession)

    render(<UserAvatar />)

    const placeholder: HTMLImageElement = screen.getByRole("img")
    expect(placeholder).toBeInTheDocument()
  })

  it("should render user avatar when session data is available", () => {
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)

    render(<UserAvatar />)

    const image: HTMLImageElement = screen.getByRole("img")
    expect(image.getAttribute("src")).toContain(encodeURIComponent("https://example.com/avatar.jpg"))
  })
})
