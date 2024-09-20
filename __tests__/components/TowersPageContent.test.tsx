import { render, screen } from "@testing-library/react"
import { useDispatch, useSelector } from "react-redux"
import { Mock } from "vitest"
import TowersPageContent from "@/components/TowersPageContent"
import { useSessionData } from "@/hooks"
import { destroySocket, initSocket, SocketState } from "@/redux/features"
import {
  mockedAuthenticatedSession,
  mockedRoom1Table1,
  mockedSocketRoom1Id,
  mockedSocketRoom1Table1Id
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

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux")

  return {
    ...actual,
    useDispatch: vi.fn(),
    useSelector: vi.fn()
  }
})

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("TowersPageContent Component", () => {
  const mockedDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    vi.mocked(useSelector).mockImplementation((selectorFn: (_: SocketState) => unknown) => {
      if (selectorFn.toString().includes("state.socket.tables")) {
        return mockedRoom1Table1
      }
      return undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render Room component if tableId is not provided", () => {
    render(<TowersPageContent roomId={mockedSocketRoom1Id} tableId="" />)

    expect(screen.getByText("Play Now")).toBeInTheDocument()
    expect(screen.getByText("Exit Room")).toBeInTheDocument()
  })

  it("should render Table component if tableId is provided", () => {
    render(<TowersPageContent roomId={mockedSocketRoom1Id} tableId={mockedSocketRoom1Table1Id} />)

    expect(screen.getByText("Start")).toBeInTheDocument()
    expect(screen.getByText("Quit")).toBeInTheDocument()
  })

  it("should dispatch initSocket when not connected and session is authenticated", () => {
    render(<TowersPageContent roomId={mockedSocketRoom1Id} tableId="" />)

    expect(mockedDispatch).toHaveBeenCalledWith(initSocket())
  })

  it("should dispatche destroySocket when offline event is triggered", () => {
    render(<TowersPageContent roomId={mockedSocketRoom1Id} tableId="" />)

    window.dispatchEvent(new Event("offline"))
    expect(mockedDispatch).toHaveBeenCalledWith(destroySocket())
  })

  it("should update session on online event", () => {
    render(<TowersPageContent roomId={mockedSocketRoom1Id} tableId="" />)

    window.dispatchEvent(new Event("online"))
    expect(mockedAuthenticatedSession.update).toHaveBeenCalled()
  })
})
