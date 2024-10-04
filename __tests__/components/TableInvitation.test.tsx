import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableInvitation from "@/components/game/TableInvitation"

describe("TableInvitation Component", () => {
  const mockedTableInvitationData = {
    user: { username: "jane.doe" },
    table: { tableNumber: 5, rated: true }
  }

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the invitation details", () => {
    const mockedHandleAcceptInvitation: Mock = vi.fn()
    const mockedHandleCancel: Mock = vi.fn()

    render(
      <TableInvitation
        isOpen={true}
        data={mockedTableInvitationData}
        onAcceptInvitation={mockedHandleAcceptInvitation}
        onCancel={mockedHandleCancel}
      />
    )

    expect(screen.getByText("jane.doe (2552) invited you to table #5.")).toBeInTheDocument()
    expect(screen.getByText("Game option: Rated")).toBeInTheDocument()
  })

  it("should handle invitation acceptance", () => {
    const mockedHandleAcceptInvitation: Mock = vi.fn()
    const mockedHandleCancel: Mock = vi.fn()

    render(
      <TableInvitation
        isOpen={true}
        data={mockedTableInvitationData}
        onAcceptInvitation={mockedHandleAcceptInvitation}
        onCancel={mockedHandleCancel}
      />
    )

    fireEvent.click(screen.getByText("Accept"))

    expect(mockedHandleAcceptInvitation).toHaveBeenCalledWith("test-34")
  })

  it("should handle invitation decline", () => {
    const mockedHandleAcceptInvitation: Mock = vi.fn()
    const mockedHandleCancel: Mock = vi.fn()

    render(
      <TableInvitation
        isOpen={true}
        data={mockedTableInvitationData}
        onAcceptInvitation={mockedHandleAcceptInvitation}
        onCancel={mockedHandleCancel}
      />
    )

    fireEvent.click(screen.getByText("Decline"))

    expect(mockedHandleCancel).toHaveBeenCalled()
  })
})
