import { ImgHTMLAttributes } from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import Table from "@/components/game/Table"
import { ROUTE_TOWERS } from "@/constants/routes"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { leaveTable } from "@/redux/features/socket-slice"
import { mockRoom1 } from "@/test/data/rooms"
import { mockSession } from "@/test/data/session"
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
    get: vi.fn((key: string) => {
      if (key === "room") return mockRoom1.id
      if (key === "table") return mockRoom1Table1.id
      return null
    }),
  })),
}))

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe("Table Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render the correct table type and rated status", () => {
    render(<Table />)

    expect(screen.getByText("Public")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it.todo("should handle seat click correctly", () => {
    render(<Table />)
  })

  it("should navigate to the room on successful room exit", () => {
    render(<Table />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Quit")
    fireEvent.click(exitRoomButton)

    expect(mockAppDispatch).toHaveBeenCalledWith(
      leaveTable({
        roomId: mockRoom1.id,
        tableId: mockRoom1Table1.id,
      }),
    )

    waitFor(() => {
      expect(mockUseRouter).toHaveBeenCalledWith(`${ROUTE_TOWERS.PATH}?room=${mockRoom1.id}`)
    })
  })
})
