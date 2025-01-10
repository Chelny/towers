import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableInviteUser from "@/components/game/TableInviteUser"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { mockSession } from "@/test/data/session"
import { mockSocketRoom1Table1Id } from "@/test/data/socketState"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe("TableInviteUser Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
  })

  it("should render the invite user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser tableId={mockSocketRoom1Table1Id} isOpen={true} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    expect(screen.getByText("Invite User")).toBeInTheDocument()
  })

  it("should handle user invitation", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser tableId={mockSocketRoom1Table1Id} isOpen={true} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Invite"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser tableId={mockSocketRoom1Table1Id} isOpen={true} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
