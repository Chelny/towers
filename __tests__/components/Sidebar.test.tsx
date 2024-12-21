import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { useDispatch } from "react-redux"
import { Mock } from "vitest"
import { mockSession } from "@/__mocks__/data/users"
import Sidebar from "@/components/Sidebar"
import { authClient } from "@/lib/auth-client"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: () => new URLSearchParams("roomId=123&tableId=456"),
}))

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    const { priority, crossOrigin, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />
  },
}))

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppSelector: vi.fn(),
}))

describe("Sidebar Component", () => {
  const mockDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the sidebar in collapsed state initially", () => {
    render(<Sidebar />)

    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument()
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
  })

  it("should expand the sidebar when expand button is clicked", () => {
    render(<Sidebar />)

    const expandButton: HTMLButtonElement = screen.getByLabelText("Expand sidebar")
    fireEvent.click(expandButton)

    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("should call mockDispatch and signOut on sign out button click", () => {
    render(<Sidebar />)

    const expandButton: HTMLButtonElement = screen.getByLabelText("Expand sidebar")
    fireEvent.click(expandButton)

    const signOutButton: HTMLButtonElement = screen.getByLabelText("Sign out")
    fireEvent.click(signOutButton)

    expect(mockDispatch).toHaveBeenCalled()
    expect(authClient.signOut).toHaveBeenCalled()
  })
})
