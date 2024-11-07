import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockTowersTableState11Users } from "@/__mocks__/data/socketState"
import TableBootUser from "@/components/game/TableBootUser"

describe("TableBootUser Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the boot user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser isOpen={true} users={mockTowersTableState11Users} isRatingsVisible onCancel={mockHandleCancel} />
    )

    expect(screen.getByText("Boot User")).toBeInTheDocument()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser isOpen={true} users={mockTowersTableState11Users} isRatingsVisible onCancel={mockHandleCancel} />
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should handle user boot action", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser isOpen={true} users={mockTowersTableState11Users} isRatingsVisible onCancel={mockHandleCancel} />
    )

    fireEvent.click(screen.getByText("Boot"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
