import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import CreateTable from "@/components/game/CreateTableModal"
import { TableType } from "@/enums/table-type"
import { authClient } from "@/lib/auth-client"
import { mockSession } from "@/test/data/session"

const socketEmitMock: Mock = vi.fn()
const mockSocket: { emit: Mock } = { emit: socketEmitMock }

vi.mock("@/context/SocketContext", async () => {
  const actual = await vi.importActual("@/context/SocketContext")
  return {
    ...actual,
    useSocket: () => ({ socket: mockSocket }),
  }
})

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const mockRoomId: string = "mock-room-1"

describe("CreateTableModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
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

    socketEmitMock.mockImplementationOnce((event, payload, callback) => {
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
