import { TowersUser } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayerInformation from "@/components/game/PlayerInformation"
import { useSessionData } from "@/hooks/useSessionData"
import { mockedAuthenticatedSession, mockedUser1, mockedUser2 } from "@/vitest.setup"

const mockCurrentPlayer: TowersUser = {
  towersUserProfile: {
    rating: 1500,
    gamesCompleted: 10,
    wins: 5,
    loses: 5,
    streak: 3,
    user: mockedUser1
  },
  room: {},
  table: {}
} as TowersUser

const mockOtherPlayer: TowersUser = {
  towersUserProfile: {
    rating: 1500,
    gamesCompleted: 10,
    wins: 5,
    loses: 5,
    streak: 3,
    user: mockedUser2
  },
  room: {},
  table: {}
} as TowersUser

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("PlayerInformation Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
  })

  it("should hide message input and \"Send\" button when viewing current user's information", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockCurrentPlayer} onCancel={handleCancel} />)

    expect(screen.queryByLabelText("Send instant message (optional)")).not.toBeInTheDocument()
    expect(screen.queryByText("Send")).not.toBeInTheDocument()
  })

  it("should display player information correctly when the modal is open", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockOtherPlayer} onCancel={handleCancel} />)

    expect(screen.getByText(`Player information for ${mockedUser2.username}`)).toBeInTheDocument()
    expect(screen.getByText(/Rating: 1500/)).toBeInTheDocument()
    expect(screen.getByText(/Games Completed: 10/)).toBeInTheDocument()
    expect(screen.getByText(/Wins: 5/)).toBeInTheDocument()
    expect(screen.getByText(/Loses: 5/)).toBeInTheDocument()
    expect(screen.getByText(/Streak: 3/)).toBeInTheDocument()
  })

  it("should update the reason input when typed into", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockOtherPlayer} onCancel={handleCancel} />)

    const input: HTMLInputElement = screen.getByLabelText("Send instant message (optional)")
    fireEvent.input(input, { target: { value: "Test reason" } })

    expect(input).toHaveValue("Test reason")
  })

  it("should call onCancel when the \"Send\" button is clicked", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockOtherPlayer} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Send"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
