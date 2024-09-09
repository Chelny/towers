import { TableType } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import CreateTable from "@/components/CreateTable"

describe("CreateTable Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it("should render the modal with correct default values when opened", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable isOpen={true} onSubmitSuccess={handleSubmitSuccess} onCancel={handleCancel} />)

    expect(screen.getByText("Create Table")).toBeInTheDocument()
    expect(screen.getByLabelText("Table Type")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it("should update table type when selecting a new option", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable isOpen={true} onSubmitSuccess={handleSubmitSuccess} onCancel={handleCancel} />)

    fireEvent.click(screen.getByRole("combobox", { hidden: true }))
    fireEvent.click(
      screen.getByText((_, element: Element | null) => {
        return element?.textContent === "Private"
      })
    )

    expect(screen.getByDisplayValue(TableType.PRIVATE)).toBeInTheDocument()
  })

  it("should call onSubmitSuccess when the Create button is clicked", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable isOpen={true} onSubmitSuccess={handleSubmitSuccess} onCancel={handleCancel} />)
    fireEvent.click(screen.getByText("Create"))

    expect(handleSubmitSuccess).toHaveBeenCalledWith("test-2")
  })

  it("should call onCancel when the modal is closed", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable isOpen={true} onSubmitSuccess={handleSubmitSuccess} onCancel={handleCancel} />)
    fireEvent.click(screen.getByText("Cancel"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
