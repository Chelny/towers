import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Table from "@/components/Table"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { SocketState } from "@/redux/features/socket-slice"
import {
  mockedAuthenticatedSession,
  mockedRoom1,
  mockedRoom1Table1,
  mockedRoom1Table1Chat,
  mockedRoom1Table1Info,
  mockedRoom1Table1Users,
  mockedRoom1Users
} from "@/vitest.setup"

const { useRouter } = vi.hoisted(() => {
  const mockedRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush
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
  const mockedAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockedAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    // eslint-disable-next-line no-unused-vars
    vi.mocked(useAppSelector).mockImplementation((selectorFn: (state: { socket: SocketState }) => unknown) => {
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.users")) {
        return mockedRoom1Users
      }
      if (selectorFn.toString().includes("state.socket.tables")) {
        return mockedRoom1Table1
      }
      if (selectorFn.toString().includes("state.socket.tables[tableId]?.tableInfo")) {
        return mockedRoom1Table1Info
      }
      if (selectorFn.toString().includes("state.socket.tables[tableId]?.isTableInfoLoading")) {
        return false
      }
      if (selectorFn.toString().includes("state.socket.tables[tableId]?.chat")) {
        return mockedRoom1Table1Chat
      }
      if (selectorFn.toString().includes("state.socket.tables[tableId]?.isChatLoading")) {
        return false
      }
      if (selectorFn.toString().includes("state.socket.tables[tableId]?.users")) {
        return mockedRoom1Table1Users
      }
      return undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the chat input and allows message sending", () => {
    render(<Table roomId={mockedRoom1.id} tableId={mockedRoom1Table1.id} />)

    const messageInput: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(messageInput, { target: { value: "Hello!" } })
    fireEvent.keyDown(messageInput, { key: "Enter" })

    expect(mockedAppDispatch).toHaveBeenCalled()
  })

  it("should render the correct table type and rated status", () => {
    render(<Table roomId={mockedRoom1.id} tableId={mockedRoom1Table1.id} />)

    expect(screen.getByText("Public")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it.todo("should handle seat click correctly", () => {
    render(<Table roomId={mockedRoom1.id} tableId={mockedRoom1Table1.id} />)
  })
})
