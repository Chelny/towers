import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Modal from "@/components/ui/Modal"

describe("Modal Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the modal with title and children", () => {
    render(
      <Modal title="Test Modal" isOpen={true}>
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.getByText("Test Modal")).toBeInTheDocument()
    expect(screen.getByText("Modal content")).toBeInTheDocument()
  })

  it("should not render the modal when isOpen is false", () => {
    render(
      <Modal title="Test Modal" isOpen={false}>
        <p>Modal content</p>
      </Modal>
    )

    const modal: HTMLElement | null = screen.queryByText("Test Modal")
    expect(modal).not.toBeInTheDocument()
  })

  it("should render the modal when isOpen is true", () => {
    render(
      <Modal title="Test Modal" isOpen={true}>
        <p>Modal content</p>
      </Modal>
    )

    const modal: HTMLElement | null = screen.getByText("Test Modal")
    expect(modal).toBeInTheDocument()
  })

  it("should call onClose when close button is clicked", () => {
    const handleClose: Mock = vi.fn()

    render(
      <Modal title="Test Modal" isOpen={true} onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    )

    const closeButton: HTMLButtonElement = screen.getByText("Close")
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("should call onConfirm when confirm button is clicked", () => {
    const handleConfirm: Mock = vi.fn()

    render(
      <Modal title="Test Modal" isOpen={true} onConfirm={handleConfirm}>
        <p>Modal content</p>
      </Modal>
    )

    const confirmButton: HTMLButtonElement = screen.getByText("Confirm")
    fireEvent.click(confirmButton)

    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it("should display custom close and confirm button text", () => {
    render(
      <Modal title="Test Modal" isOpen={true} closeText="Dismiss" confirmText="Proceed" onConfirm={vi.fn()}>
        <p>Modal content</p>
      </Modal>
    )

    expect(screen.getByText("Dismiss")).toBeInTheDocument()
    expect(screen.getByText("Proceed")).toBeInTheDocument()
  })

  it("should close the modal when clicking the confirm button", () => {
    const handleClose: Mock = vi.fn()

    render(
      <Modal title="Test Modal" isOpen={true} onClose={handleClose} onConfirm={handleClose}>
        <p>Modal content</p>
      </Modal>
    )

    const confirmButton: HTMLButtonElement = screen.getByText("Confirm")
    fireEvent.click(confirmButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("should close the modal when clicking the close button", () => {
    const handleClose: Mock = vi.fn()

    render(
      <Modal title="Test Modal" isOpen={true} onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    )

    const closeButton: HTMLButtonElement = screen.getByText("Close")
    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("should close the modal when escape key is pressed", () => {
    const handleClose: Mock = vi.fn()

    render(
      <Modal title="Test Modal" isOpen={true} dataTestId="test-modal" onClose={handleClose}>
        <p>Modal content</p>
      </Modal>
    )

    const dialog: HTMLDialogElement = screen.getByTestId("test-modal")
    fireEvent.keyDown(dialog!, {
      key: "Escape",
      code: "Escape",
      keyCode: 27,
      charCode: 27
    })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
