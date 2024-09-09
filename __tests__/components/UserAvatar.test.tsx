import { render, screen } from "@testing-library/react"
import UserAvatar from "@/components/UserAvatar"
import { useSessionData } from "@/hooks"
import { mockedAuthenticatedSession, mockedLoadingSession, mockedUnauthenticatedSession } from "@/vitest.setup"

vi.mock("@/hooks", () => ({
  useSessionData: vi.fn()
}))

describe("UserAvatar Component", () => {
  it("should render placeholder avatar when session data is not available", () => {
    vi.mocked(useSessionData).mockReturnValue(mockedLoadingSession)

    render(<UserAvatar />)

    const placeholder: HTMLImageElement = screen.getByRole("img")
    expect(placeholder).toBeInTheDocument()
  })

  it("should handle missing session user correctly", () => {
    vi.mocked(useSessionData).mockReturnValue(mockedUnauthenticatedSession)

    render(<UserAvatar />)

    const placeholder: HTMLImageElement = screen.getByRole("img")
    expect(placeholder).toBeInTheDocument()
  })

  it("should render user avatar when session data is available", () => {
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)

    render(<UserAvatar />)

    const image: HTMLImageElement = screen.getByRole("img")
    expect(image.getAttribute("src")).toContain(encodeURIComponent("https://example.com/avatar.jpg"))
  })
})
