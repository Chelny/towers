import { ImgHTMLAttributes } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import TowersPageContent from "@/components/game/TowersPageContent"
import { GameProvider } from "@/context/GameContext"
import { ModalProvider } from "@/context/ModalContext"
import { authClient } from "@/lib/auth-client"
import { mockSession } from "@/test/data/session"
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
  })),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const mockRoomId: string = "mock-room-1"
const mockTableId: string = "mock-table-1"

const renderTowersPageContent = () => {
  render(
    <GameProvider>
      <ModalProvider>
        <TowersPageContent />
      </ModalProvider>
    </GameProvider>,
  )
}

describe("TowersPageContent", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render Room component if tableId is not provided", () => {
    vi.mocked(mockUseSearchParams.get).mockImplementation((key) => {
      if (key === "room") return mockRoomId
      return null
    })

    renderTowersPageContent()

    waitFor(() => {
      expect(screen.getByText("Play Now")).toBeInTheDocument()
      expect(screen.getByText("Exit Room")).toBeInTheDocument()
    })
  })

  it("should render Table component if tableId is provided", () => {
    vi.mocked(mockUseSearchParams.get).mockImplementation((key) => {
      if (key === "room") return mockRoomId
      if (key === "table") return mockTableId
      return null
    })

    renderTowersPageContent()

    waitFor(() => {
      expect(screen.getByText("Start")).toBeInTheDocument()
      expect(screen.getByText("Quit")).toBeInTheDocument()
    })
  })
})
