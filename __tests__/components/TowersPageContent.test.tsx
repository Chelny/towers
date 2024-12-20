import { ImgHTMLAttributes } from "react"
import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockSocketRoom1Id, mockSocketRoom1Table1Id } from "@/__mocks__/data/socketState"
import { mockSession } from "@/__mocks__/data/users"
import TowersPageContent from "@/components/game/TowersPageContent"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { destroySocket, initSocket } from "@/redux/features/socket-slice"

const { useRouter } = vi.hoisted(() => {
  const mockRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockRouterPush }),
    mockRouterPush,
  }
})

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    const { priority, crossOrigin, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />
  },
}))

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter,
  }
})

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", async () => {
  const actual = await vi.importActual("@/lib/hooks")

  return {
    ...actual,
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
  }
})

describe("TowersPageContent Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
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

    expect(mockAppDispatch).toHaveBeenCalledWith(initSocket({ session: mockSession.data }))
  })

  it("should dispatche destroySocket when offline event is triggered", () => {
    render(<TowersPageContent roomId={mockSocketRoom1Id} tableId="" />)

    window.dispatchEvent(new Event("offline"))
    expect(mockAppDispatch).toHaveBeenCalledWith(destroySocket())
  })
})
