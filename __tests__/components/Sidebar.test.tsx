import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { signOut } from "next-auth/react"
import { useDispatch } from "react-redux"
import { Mock } from "vitest"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import Sidebar from "@/components/Sidebar"
import { useSessionData } from "@/hooks/useSessionData"

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    const { priority, crossOrigin, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />
  },
}))

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}))

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
}))

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn(),
}))

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}))

vi.mock("@/lib/hooks", () => ({
  useAppSelector: vi.fn(),
}))

describe("Sidebar Component", () => {
  const mockDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
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
    expect(signOut).toHaveBeenCalled()
  })
})
