import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockSocketRoom1Table1Id, mockSocketStateTables } from "@/__mocks__/data/socketState"
import TableBootUser from "@/components/game/TableBootUser"

describe("TableBootUser Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the boot user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser
        isOpen={true}
        users={mockSocketStateTables[mockSocketRoom1Table1Id].users}
        onCancel={mockHandleCancel}
      />
    )

    expect(screen.getByText("Boot User")).toBeInTheDocument()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser
        isOpen={true}
        users={mockSocketStateTables[mockSocketRoom1Table1Id].users}
        onCancel={mockHandleCancel}
      />
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should handle user boot action", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser
        isOpen={true}
        users={mockSocketStateTables[mockSocketRoom1Table1Id].users}
        onCancel={mockHandleCancel}
      />
    )

    fireEvent.click(screen.getByText("Boot"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
