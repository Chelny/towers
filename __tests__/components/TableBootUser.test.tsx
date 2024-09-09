import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableBootUser from "@/components/TableBootUser"
import { mockedRoom1Table1TowersGameUsers } from "@/vitest.setup"

describe("TableBootUser Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the boot user modal", () => {
    const mockedHandleCancel: Mock = vi.fn()

    render(<TableBootUser isOpen={true} users={mockedRoom1Table1TowersGameUsers} onCancel={mockedHandleCancel} />)

    expect(screen.getByText("Boot User")).toBeInTheDocument()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockedHandleCancel: Mock = vi.fn()

    render(<TableBootUser isOpen={true} users={mockedRoom1Table1TowersGameUsers} onCancel={mockedHandleCancel} />)

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockedHandleCancel).toHaveBeenCalled()
  })

  it("should handle user boot action", () => {
    const mockedHandleCancel: Mock = vi.fn()

    render(<TableBootUser isOpen={true} users={mockedRoom1Table1TowersGameUsers} onCancel={mockedHandleCancel} />)

    fireEvent.click(screen.getByText("Boot"))
    expect(mockedHandleCancel).toHaveBeenCalled()
  })
})
