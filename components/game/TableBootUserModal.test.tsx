import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableBootUserModal from "@/components/game/TableBootUserModal"

const mockRoomId: string = "mock-room-1"
const mockTableId: string = "mock-table-1"

describe("TableBootUserModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the boot user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUserModal roomId={mockRoomId} tableId={mockTableId} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    expect(screen.getByText("Boot User")).toBeInTheDocument()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUserModal roomId={mockRoomId} tableId={mockTableId} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should handle user boot action", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUserModal roomId={mockRoomId} tableId={mockTableId} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Boot"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
