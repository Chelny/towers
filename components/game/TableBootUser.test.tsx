import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import TableBootUser from "@/components/game/TableBootUser"
import { authClient } from "@/lib/auth-client"
import { useAppDispatch } from "@/lib/hooks"
import { mockSession } from "@/test/data/session"
import { mockSocketRoom1Table1Id } from "@/test/data/socketState"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

vi.mock("@/lib/hooks", () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe("TableBootUser Component", () => {
  const mockAppDispatch: Mock = vi.fn()

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
    vi.mocked(useAppDispatch).mockReturnValue(mockAppDispatch)
  })

  it("should render the boot user modal", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser tableId={mockSocketRoom1Table1Id} isOpen={true} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    expect(screen.getByText("Boot User")).toBeInTheDocument()
  })

  it("should call onCancel when cancel button is clicked", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser tableId={mockSocketRoom1Table1Id} isOpen={true} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Cancel"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should handle user boot action", () => {
    const mockHandleCancel: Mock = vi.fn()

    render(
      <TableBootUser tableId={mockSocketRoom1Table1Id} isOpen={true} isRatingsVisible onCancel={mockHandleCancel} />,
    )

    fireEvent.click(screen.getByText("Boot"))
    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
