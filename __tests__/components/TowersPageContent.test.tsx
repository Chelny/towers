import { render, screen } from "@testing-library/react"
import { useDispatch, useSelector } from "react-redux"
import { Mock } from "vitest"
import TowersPageContent from "@/components/TowersPageContent"
import { destroySocket, initSocket, SocketState } from "@/features"
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

describe("TowersPageContent Component", () => {
  const mockedDispatch: Mock = vi.fn()
  const mockedSocketState: Partial<SocketState> = {
    isConnected: false,
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
    tablesUsers: {},
    tablesUsersLoading: false,
    error: ""
  }

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    vi.mocked(useSelector).mockReturnValue(mockedSocketState)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render Room component if tableId is not provided", () => {
    render(<TowersPageContent roomId={mockedRoom1.id} tableId="" />)

    expect(screen.getByText("Play Now")).toBeInTheDocument()
    expect(screen.getByText("Exit Room")).toBeInTheDocument()
  })

  it("should render Table component if tableId is provided", () => {
    render(<TowersPageContent roomId={mockedRoom1.id} tableId={mockedRoom1Table1.id} />)

    expect(screen.getByText("Start")).toBeInTheDocument()
    expect(screen.getByText("Quit")).toBeInTheDocument()
  })

  it("should dispatch initSocket when not connected and session is authenticated", () => {
    render(<TowersPageContent roomId={mockedRoom1.id} tableId="" />)

    expect(mockedDispatch).toHaveBeenCalledWith(initSocket())
  })

  it("should dispatche destroySocket when offline event is triggered", () => {
    render(<TowersPageContent roomId={mockedRoom1.id} tableId="" />)

    window.dispatchEvent(new Event("offline"))
    expect(mockedDispatch).toHaveBeenCalledWith(destroySocket())
  })

  it("should update session on online event", () => {
    render(<TowersPageContent roomId={mockedRoom1.id} tableId="" />)

    window.dispatchEvent(new Event("online"))
    expect(mockedAuthenticatedSession.update).toHaveBeenCalled()
  })
})
