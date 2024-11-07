import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockTowersTableState11Users } from "@/__mocks__/data/socketState"
import TableInviteUser from "@/components/game/TableInviteUser"

describe("TableInviteUser Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the invite user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser isOpen={true} users={mockTowersTableState11Users} isRatingsVisible onCancel={mockHandleCancel} />
    )

    expect(screen.getByText("Invite User")).toBeInTheDocument()
  })

  it("should handle user invitation", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser isOpen={true} users={mockTowersTableState11Users} isRatingsVisible onCancel={mockHandleCancel} />
    )

    fireEvent.click(screen.getByText("Invite"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser isOpen={true} users={mockTowersTableState11Users} isRatingsVisible onCancel={mockHandleCancel} />
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
