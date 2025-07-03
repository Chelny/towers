import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayerInformation from "@/components/game/PlayerInformationModal"
import { authClient } from "@/lib/auth-client"
import { UserPlainObject } from "@/server/towers/classes/User"
import { mockSession } from "@/test/data/session"
import { mockUser1, mockUser2 } from "@/test/data/user"
import { mockUserStats1, mockUserStats2 } from "@/test/data/user-stats"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const mockPlayer1: UserPlainObject = {
  user: {
    ...mockUser1,
    lastActiveAt: new Date().toISOString(),
  },
  stats: mockUserStats1,
} as unknown as UserPlainObject

const mockPlayer2: UserPlainObject = {
  user: {
    ...mockUser2,
    lastActiveAt: new Date().toISOString(),
  },
  stats: mockUserStats2,
} as unknown as UserPlainObject

describe("PlayerInformation", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  it("should hide message input and \"Send\" button when viewing current user's information", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation player={mockPlayer1} onCancel={handleCancel} />)

    expect(screen.queryByLabelText(/Send instant message/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Send/i)).not.toBeInTheDocument()
  })

  it("should display player information correctly when the modal is open", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation player={mockPlayer2} isRatingsVisible={true} onCancel={handleCancel} />)

    expect(screen.getByText("Player information of janesmith")).toBeInTheDocument()
    expect(screen.getByText(/Rating: 1200/)).toBeInTheDocument()
    expect(screen.getByText(/Games Completed: 0/)).toBeInTheDocument()
    expect(screen.getByText(/Wins: 0/)).toBeInTheDocument()
    expect(screen.getByText(/Loses: 0/)).toBeInTheDocument()
    expect(screen.getByText(/Streak: 0/)).toBeInTheDocument()
  })

  it("should update the reason input when typed into", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation player={mockPlayer2} onCancel={handleCancel} />)

    const input: HTMLInputElement = screen.getByLabelText(/Send instant message/i)
    fireEvent.input(input, { target: { value: "Test reason" } })

    expect(input).toHaveValue("Test reason")
  })

  it("should call onCancel when the \"Send\" button is clicked", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation player={mockPlayer2} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Send"))

    expect(handleCancel).not.toHaveBeenCalled()
  })
})
