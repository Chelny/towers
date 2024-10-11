import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import {
  mockRoom1Table1Chat,
  mockRoom1Table1Info,
  mockRoom1Table1Users,
  mockRoom1Users
} from "@/__mocks__/data/socketState"
import { mockRoom1Table1 } from "@/__mocks__/data/tables"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import Table from "@/components/game/Table"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { SidebarState } from "@/redux/features/sidebar-slice"
import { SocketState } from "@/redux/features/socket-slice"

const { useRouter } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter
  }
})

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn()
}))

describe("Table Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
    // eslint-disable-next-line no-unused-vars
    vi.mocked(useAppSelector).mockImplementation(
      (selectorFn: (state: { socket: SocketState; sidebar: SidebarState }) => unknown) => {
        if (selectorFn.toString().includes("state.socket.rooms[roomId]?.users")) return mockRoom1Users
        if (selectorFn.toString().includes("state.socket.tables")) return mockRoom1Table1
        if (selectorFn.toString().includes("state.socket.tables[tableId]?.tableInfo")) return mockRoom1Table1Info
        if (selectorFn.toString().includes("state.socket.tables[tableId]?.isTableInfoLoading")) return false
        if (selectorFn.toString().includes("state.socket.tables[tableId]?.chat")) return mockRoom1Table1Chat
        if (selectorFn.toString().includes("state.socket.tables[tableId]?.isChatLoading")) return false
        if (selectorFn.toString().includes("state.socket.tables[tableId]?.users")) return mockRoom1Table1Users
        return undefined
      }
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the chat input and allows message sending", () => {
    render(<Table roomId={mockRoom1.id} tableId={mockRoom1Table1.id} />)

    const messageInput: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(messageInput, { target: { value: "Hello!" } })
    fireEvent.keyDown(messageInput, { key: "Enter" })

    expect(mockAppDispatch).toHaveBeenCalled()
  })

  it("should render the correct table type and rated status", () => {
    render(<Table roomId={mockRoom1.id} tableId={mockRoom1Table1.id} />)

    expect(screen.getByText("Public")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it.todo("should handle seat click correctly", () => {
    render(<Table roomId={mockRoom1.id} tableId={mockRoom1Table1.id} />)
  })
})
