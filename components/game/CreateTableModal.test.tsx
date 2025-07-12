import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import CreateTable from "@/components/game/CreateTableModal"
import { TableType } from "@/enums/table-type"
import { mockSocket } from "@/test/data/socket"

const mockRoomId: string = "mock-room-1"

describe("CreateTableModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it("renders modal with default values", () => {
    const handleCreateTableSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable roomId={mockRoomId} onCreateTableSuccess={handleCreateTableSuccess} onCancel={handleCancel} />)

    expect(screen.getByText("Create Table")).toBeInTheDocument()
    expect(screen.getByLabelText("Table Type")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it("updates table type selection", () => {
    const handleCreateTableSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable roomId={mockRoomId} onCreateTableSuccess={handleCreateTableSuccess} onCancel={handleCancel} />)

    fireEvent.click(screen.getByRole("combobox", { hidden: true }))
    fireEvent.click(screen.getByText("Private"))

    expect(screen.getByDisplayValue(TableType.PRIVATE)).toBeInTheDocument()
  })

  it("calls onCreateTableSuccess with tableId when created", async () => {
    const handleCreateTableSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()
    const tableId: string = "mock-table-1"

    mockSocket.current.emit.mockImplementationOnce((event, payload, callback) => {
      callback({ success: true, message: "ok", data: { tableId } })
    })

    render(<CreateTable roomId={mockRoomId} onCreateTableSuccess={handleCreateTableSuccess} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Create"))

    await waitFor(() => {
      expect(handleCreateTableSuccess).toHaveBeenCalledWith(tableId)
    })
  })

  it("calls onCancel when Cancel is clicked", () => {
    const handleCreateTableSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(<CreateTable roomId={mockRoomId} onCreateTableSuccess={handleCreateTableSuccess} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Cancel"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
