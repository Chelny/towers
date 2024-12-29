import { ImgHTMLAttributes } from "react"
import { render, screen } from "@testing-library/react"
import UserAvatar from "@/components/UserAvatar"
import { authClient } from "@/lib/auth-client"
import { mockErrorSession, mockPendingSession, mockSession } from "@/test/data/users"

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    const { priority, crossOrigin, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />
  },
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

describe("UserAvatar Component", () => {
  it("should render placeholder avatar when session data is not available", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockErrorSession)

    render(<UserAvatar />)

    const placeholder: HTMLImageElement = screen.getByRole("img")
    expect(placeholder).toBeInTheDocument()
  })

  it("should handle missing session user correctly", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockPendingSession)

    render(<UserAvatar />)

    const placeholder: HTMLImageElement = screen.getByRole("img")
    expect(placeholder).toBeInTheDocument()
  })

  it("should render user avatar when session data is available", () => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)

    render(<UserAvatar />)

    const image: HTMLImageElement = screen.getByRole("img")
    expect(image.getAttribute("src")).toBe("https://example.com/avatar.jpg")
  })
})
