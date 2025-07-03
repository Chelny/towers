import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import Table from "@/components/game/Table"
import { ROUTE_TOWERS } from "@/constants/routes"
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
    get: vi.fn((key: string) => {
      if (key === "room") return "mock-room-1"
      if (key === "table") return "mock-table-1"
      return null
    }),
  })),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const renderTable = () => {
  render(
    <GameProvider>
      <ModalProvider>
        <Table />
      </ModalProvider>
    </GameProvider>,
  )
}

describe("Table", () => {
  beforeEach(() => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the correct table type and rated status", () => {
    renderTable()

    waitFor(() => {
      expect(screen.getByText("Public")).toBeInTheDocument()
      expect(screen.getByLabelText("Rated Game")).toBeChecked()
    })
  })

  it("should navigate to the room on successful room exit", () => {
    renderTable()

    waitFor(() => {
      const exitRoomButton: HTMLButtonElement = screen.getByText("Quit")
      fireEvent.click(exitRoomButton)

      expect(mockUseRouter).toHaveBeenCalledWith(`${ROUTE_TOWERS.PATH}?room=mock-room-1`)
    })
  })
})
