import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockSocketRoom1Id, mockSocketRoom1Table1Id } from "@/__mocks__/data/socketState"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import TowersPageContent from "@/components/game/TowersPageContent"
import { useSessionData } from "@/hooks/useSessionData"
import { useAppDispatch } from "@/lib/hooks"
import { destroySocket, initSocket } from "@/redux/features/socket-slice"

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

vi.mock("@/lib/hooks", async () => {
  const actual = await vi.importActual("@/lib/hooks")

  return {
    ...actual,
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn()
  }
})

describe("TowersPageContent Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render Room component if tableId is not provided", () => {
    render(<TowersPageContent roomId={mockSocketRoom1Id} tableId="" />)

    expect(screen.getByText("Play Now")).toBeInTheDocument()
    expect(screen.getByText("Exit Room")).toBeInTheDocument()
  })

  it("should render Table component if tableId is provided", () => {
    render(<TowersPageContent roomId={mockSocketRoom1Id} tableId={mockSocketRoom1Table1Id} />)

    expect(screen.getByText("Start")).toBeInTheDocument()
    expect(screen.getByText("Quit")).toBeInTheDocument()
  })

  it("should dispatch initSocket when not connected and session is authenticated", () => {
    render(<TowersPageContent roomId={mockSocketRoom1Id} tableId="" />)

    expect(mockAppDispatch).toHaveBeenCalledWith(initSocket())
  })

  it("should dispatche destroySocket when offline event is triggered", () => {
    render(<TowersPageContent roomId={mockSocketRoom1Id} tableId="" />)

    window.dispatchEvent(new Event("offline"))
    expect(mockAppDispatch).toHaveBeenCalledWith(destroySocket())
  })

  it("should update session on online event", () => {
    render(<TowersPageContent roomId={mockSocketRoom1Id} tableId="" />)

    window.dispatchEvent(new Event("online"))
    expect(mockAuthenticatedSession.update).toHaveBeenCalled()
  })
})
