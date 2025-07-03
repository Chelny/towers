import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import Sidebar from "@/components/Sidebar"
import { GameProvider } from "@/context/GameContext"
import { ModalProvider } from "@/context/ModalContext"
import { authClient } from "@/lib/auth-client"
import { mockSession } from "@/test/data/session"
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

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
    useSession: vi.fn(),
  },
}))

const renderSidebar = () => {
  render(
    <GameProvider>
      <ModalProvider>
        <Sidebar />
      </ModalProvider>
    </GameProvider>,
  )
}

describe("Sidebar", () => {
  beforeEach(() => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the sidebar in collapsed state initially", () => {
    renderSidebar()

    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument()
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument()
  })

  it("should expand the sidebar when expand button is clicked", () => {
    renderSidebar()

    const expandButton: HTMLButtonElement = screen.getByLabelText("Expand sidebar")
    fireEvent.click(expandButton)

    expect(screen.getByText("John Doe")).toBeInTheDocument()
  })

  it("should signOut which clicking the sign out button", () => {
    renderSidebar()

    const expandButton: HTMLButtonElement = screen.getByLabelText("Expand sidebar")
    fireEvent.click(expandButton)

    const signOutButton: HTMLButtonElement = screen.getByLabelText("Sign out")
    fireEvent.click(signOutButton)

    expect(authClient.signOut).toHaveBeenCalled()
  })
})
