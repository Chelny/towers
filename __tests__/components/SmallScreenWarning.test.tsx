import { fireEvent, render, screen } from "@testing-library/react"
import { signOut } from "next-auth/react"
import { Mock } from "vitest"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import SmallScreenWarning from "@/components/SmallScreenWarning"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch } from "@/lib/hooks"
import { destroySocket } from "@/redux/features/socket-slice"

vi.mock("next-auth/react", () => ({
  signOut: vi.fn()
}))

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn()
}))

describe("SmallScreenWarning Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
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
    expect(signOut).toHaveBeenCalled()
  })
})
