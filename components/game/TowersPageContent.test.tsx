import { ImgHTMLAttributes } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import TowersPageContent from "@/components/game/TowersPageContent"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { destroySocket, initSocket } from "@/redux/features/socket-slice"
import { mockRoom1 } from "@/test/data/rooms"
import { mockSession } from "@/test/data/session"
import { mockSocketRoom1Id, mockSocketRoom1Table1Id } from "@/test/data/socketState"
import { mockRoom1Table1 } from "@/test/data/tables"
import { mockUseRouter, mockUseSearchParams } from "@/vitest.setup"

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    const { priority, crossOrigin, ...restProps } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />
  },
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => ({
    ...mockUseSearchParams,
    // get: vi.fn((key: string) => {
    //   if (key === "room") return mockRoom1.id
    //   if (key === "table") return mockRoom1Table1.id
    //   return null
    // }),
  })),
}))

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
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render Room component if tableId is not provided", () => {
    vi.mocked(mockUseSearchParams.get).mockImplementation((key) => {
      if (key === "room") return mockRoom1.id
      return null
    })

    render(<TowersPageContent />)

    expect(screen.getByText("Play Now")).toBeInTheDocument()
    expect(screen.getByText("Exit Room")).toBeInTheDocument()
  })

  it("should render Table component if tableId is provided", () => {
    vi.mocked(mockUseSearchParams.get).mockImplementation((key) => {
      if (key === "room") return mockRoom1.id
      if (key === "table") return mockRoom1Table1.id
      return null
    })

    render(<TowersPageContent />)

    expect(screen.getByText("Start")).toBeInTheDocument()
    expect(screen.getByText("Quit")).toBeInTheDocument()
  })

  it("should dispatch initSocket when not connected and session is authenticated", () => {
    vi.mocked(mockUseSearchParams.get).mockImplementation((key) => {
      if (key === "room") return mockRoom1.id
      return null
    })

    render(<TowersPageContent />)

    expect(mockAppDispatch).toHaveBeenCalledWith(initSocket({ session: mockSession.data }))
  })

  it("should dispatche destroySocket when offline event is triggered", () => {
    vi.mocked(mockUseSearchParams.get).mockImplementation((key) => {
      if (key === "room") return mockRoom1.id
      return null
    })

    render(<TowersPageContent />)

    window.dispatchEvent(new Event("offline"))
    expect(mockAppDispatch).toHaveBeenCalledWith(destroySocket())
  })
})
