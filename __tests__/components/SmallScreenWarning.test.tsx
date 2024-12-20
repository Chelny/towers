import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockSession } from "@/__mocks__/data/users"
import SmallScreenWarning from "@/components/SmallScreenWarning"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { destroySocket } from "@/redux/features/socket-slice"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
}))

describe("SmallScreenWarning Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render warning message", () => {
    render(<SmallScreenWarning />)

    expect(screen.getByText("Screen Too Small")).toBeInTheDocument()
    expect(screen.getByText(/Resize the window \(recommended size: 1350px by 768px\)/)).toBeInTheDocument()
  })

  it("should render sign out button when session exists", () => {
    render(<SmallScreenWarning />)

    const signOutButton: HTMLButtonElement = screen.getByRole("button", { name: /Sign out/i })
    expect(signOutButton).toBeInTheDocument()
  })

  it("should call signOut and dispatch when clicking sign out button", () => {
    render(<SmallScreenWarning />)

    const signOutButton: HTMLButtonElement = screen.getByRole("button", { name: /Sign out/i })
    fireEvent.click(signOutButton)

    expect(mockAppDispatch).toHaveBeenCalledWith(destroySocket())
    expect(authClient.signOut).toHaveBeenCalled()
  })
})
