import { fireEvent, render, screen } from "@testing-library/react"
import { useDispatch, useSelector } from "react-redux"
import { Mock } from "vitest"
import Table from "@/components/Table"
import { useSessionData } from "@/hooks"
import {
  mockedAuthenticatedSession,
  mockedRoom1,
  mockedRoom1Table1,
  mockedSocketStateRooms,
  mockedSocketStateTables
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

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn()
}))

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("Table Component", () => {
  const mockedDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    vi.mocked(useSelector).mockReturnValue({
      socketRooms: {},
      rooms: mockedSocketStateRooms,
      roomsLoading: false,
      roomsChat: {},
      roomsChatLoading: false,
      roomsUsers: {},
      roomsUsersLoading: false,
      tables: mockedSocketStateTables,
      tablesLoading: false,
      tablesChat: {},
      tablesChatLoading: false,
      tablesUsers: {}
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

    expect(mockedDispatch).toHaveBeenCalled()
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
