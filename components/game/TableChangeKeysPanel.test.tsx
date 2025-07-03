import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { TablePanelView } from "@/enums/table-panel-view"
import { mockSocket } from "@/vitest.setup"
import TableChangeKeysPanel from "./TableChangeKeysPanel"

vi.mock("@/context/SocketContext", async () => {
  const actual = await vi.importActual("@/context/SocketContext")
  return {
    ...actual,
    useSocket: () => ({ socket: mockSocket, isConnected: true }),
  }
})

const baseControlKeys = {
  MOVE_LEFT: "ArrowLeft",
  MOVE_RIGHT: "ArrowRight",
  CYCLE: "KeyC",
  DROP: "Space",
  USE_ITEM: "KeyU",
  USE_ITEM_ON_PLAYER_1: "Digit1",
  USE_ITEM_ON_PLAYER_2: "Digit2",
  USE_ITEM_ON_PLAYER_3: "Digit3",
  USE_ITEM_ON_PLAYER_4: "Digit4",
  USE_ITEM_ON_PLAYER_5: "Digit5",
  USE_ITEM_ON_PLAYER_6: "Digit6",
  USE_ITEM_ON_PLAYER_7: "Digit7",
  USE_ITEM_ON_PLAYER_8: "Digit8",
}

describe("TableChangeKeysPanel", () => {
  it("should render all key rows and F-key messages", () => {
    const handleChangeView: Mock = vi.fn()

    render(<TableChangeKeysPanel controlKeys={baseControlKeys} onChangeView={handleChangeView} />)

    expect(screen.getByText(/Move Piece Left/)).toBeInTheDocument()
    expect(screen.getByText(/Move Piece Right/)).toBeInTheDocument()
    expect(screen.getByText(/Cycle Piece Colors/)).toBeInTheDocument()
    expect(screen.getByText(/Drop Piece Quickly/)).toBeInTheDocument()
    expect(screen.getByText(/Automatically Use Item/)).toBeInTheDocument()
    expect(screen.getAllByText(/Use Item on Player/)).toHaveLength(8)

    for (let i = 1; i <= 12; i++) {
      expect(screen.getByText(`F${i}`)).toBeInTheDocument()
    }
  })

  it("should highlight duplicate keys and show error on save", () => {
    const handleChangeView: Mock = vi.fn()

    const duplicatedKeys = {
      ...baseControlKeys,
      MOVE_RIGHT: "ArrowLeft",
    }

    render(<TableChangeKeysPanel controlKeys={duplicatedKeys} onChangeView={handleChangeView} />)

    const saveButton: HTMLElement = screen.getByText("Save")
    fireEvent.click(saveButton)

    expect(screen.getByText(/Duplicate keys detected/)).toBeInTheDocument()
    expect(mockSocket.emit).not.toHaveBeenCalled()
  })

  it("should call socket.emit and show success on save with unique keys", () => {
    const handleChangeView: Mock = vi.fn()

    render(<TableChangeKeysPanel controlKeys={baseControlKeys} onChangeView={handleChangeView} />)

    const saveButton: HTMLElement = screen.getByText("Save")
    fireEvent.click(saveButton)

    expect(mockSocket.emit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ controlKeys: baseControlKeys }),
    )

    expect(screen.getByText(/Your key bindings have been saved successfully/)).toBeInTheDocument()
  })

  it("should call onChangeView when Cancel is clicked", () => {
    const handleChangeView: Mock = vi.fn()

    render(<TableChangeKeysPanel controlKeys={baseControlKeys} onChangeView={handleChangeView} />)

    const cancelButton: HTMLElement = screen.getByText("Cancel")
    fireEvent.click(cancelButton)

    expect(handleChangeView).toHaveBeenCalledWith(TablePanelView.GAME)
  })
})
