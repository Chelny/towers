import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableInviteUserModal from "@/components/game/TableInviteUserModal"

const mockRoomId: string = "mock-room-1"
const mockTableId: string = "mock-table-1"

describe("TableInviteUserModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the invite user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUserModal roomId={mockRoomId} tableId={mockTableId} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    expect(screen.getByText("Invite User")).toBeInTheDocument()
  })

  it("should handle user invitation", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUserModal roomId={mockRoomId} tableId={mockTableId} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Invite"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUserModal roomId={mockRoomId} tableId={mockTableId} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
