import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableInviteUser from "@/components/TableInviteUser"
import { mockedSocketRoom1Table1Id, mockedSocketStateTables } from "@/vitest.setup"

describe("TableInviteUser Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the invite user modal", () => {
    const mockedHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser
        isOpen={true}
        users={mockedSocketStateTables[mockedSocketRoom1Table1Id].users}
        onCancel={mockedHandleCancel}
      />
    )

    expect(screen.getByText("Invite User")).toBeInTheDocument()
  })

  it("should handle user invitation", () => {
    const mockedHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser
        isOpen={true}
        users={mockedSocketStateTables[mockedSocketRoom1Table1Id].users}
        onCancel={mockedHandleCancel}
      />
    )

    fireEvent.click(screen.getByText("Invite"))
    expect(mockedHandleCancel).toHaveBeenCalled()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockedHandleCancel: Mock = vi.fn()

    render(
      <TableInviteUser
        isOpen={true}
        users={mockedSocketStateTables[mockedSocketRoom1Table1Id].users}
        onCancel={mockedHandleCancel}
      />
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockedHandleCancel).toHaveBeenCalled()
  })
})
