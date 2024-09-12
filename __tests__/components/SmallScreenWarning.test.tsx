import { fireEvent, render, screen } from "@testing-library/react"
import { signOut } from "next-auth/react"
import { useDispatch } from "react-redux"
import { Mock } from "vitest"
import SmallScreenWarning from "@/components/SmallScreenWarning"
import { useSessionData } from "@/hooks"
import { destroySocket } from "@/redux/features"
import { mockedAuthenticatedSession } from "@/vitest.setup"

vi.mock("next-auth/react", () => ({
  signOut: vi.fn()
}))

vi.mock("react-redux", () => ({
  useDispatch: vi.fn()
}))

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

vi.mock("@/lib", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}))

describe("SmallScreenWarning Component", () => {
  const mockedDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
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

    expect(mockedDispatch).toHaveBeenCalledWith(destroySocket())
    expect(signOut).toHaveBeenCalled()
  })
})
