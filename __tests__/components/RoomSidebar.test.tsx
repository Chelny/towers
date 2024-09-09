import { fireEvent, render, screen } from "@testing-library/react"
import { signOut } from "next-auth/react"
import { useDispatch } from "react-redux"
import { Mock } from "vitest"
import RoomSidebar from "@/components/RoomSidebar"
import { useSessionData } from "@/hooks/useSessionData"
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

describe("RoomSidebar Component", () => {
  const mockedDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the sidebar in collapsed state initially", () => {
    render(<RoomSidebar />)
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument()
    expect(screen.queryByText("john.doe")).not.toBeInTheDocument()
  })

  it("should expand the sidebar when expand button is clicked", () => {
    render(<RoomSidebar />)

    const expandButton: HTMLButtonElement = screen.getByLabelText("Expand sidebar")
    fireEvent.click(expandButton)

    expect(screen.getByText("john.doe")).toBeInTheDocument()
  })

  it("should call mockedDispatch and signOut on sign out button click", () => {
    render(<RoomSidebar />)

    const expandButton: HTMLButtonElement = screen.getByLabelText("Expand sidebar")
    fireEvent.click(expandButton)

    const signOutButton: HTMLButtonElement = screen.getByLabelText("Sign out")
    fireEvent.click(signOutButton)

    expect(mockedDispatch).toHaveBeenCalled()
    expect(signOut).toHaveBeenCalled()
  })
})
