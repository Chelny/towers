import { ITowersUserRoomTable } from "@prisma/client"
import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { mockTowersRoomState1Users } from "@/__mocks__/data/socketState"
import { mockSession } from "@/__mocks__/data/users"
import PlayerInformation from "@/components/game/PlayerInformation"
import { authClient } from "@/lib/auth-client"

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

describe("PlayerInformation Component", () => {
  const player1: ITowersUserRoomTable = mockTowersRoomState1Users[0]
  const player2: ITowersUserRoomTable = mockTowersRoomState1Users[1]

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  it("should hide message input and \"Send\" button when viewing current user's information", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={player1} onCancel={handleCancel} />)

    expect(screen.queryByLabelText("Send instant message (optional)")).not.toBeInTheDocument()
    expect(screen.queryByText("Send")).not.toBeInTheDocument()
  })

  it("should display player information correctly when the modal is open", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={player2} isRatingsVisible onCancel={handleCancel} />)

    expect(screen.getByText(`Player information of ${player2.userProfile?.user?.username}`)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Rating: ${player2.userProfile?.rating}`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Games Completed: ${player2.userProfile?.gamesCompleted}`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Wins: ${player2.userProfile?.wins}`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Loses: ${player2.userProfile?.loses}`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Streak: ${player2.userProfile?.streak}`))).toBeInTheDocument()
  })

  it("should update the reason input when typed into", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={player2} onCancel={handleCancel} />)

    const input: HTMLInputElement = screen.getByLabelText("Send instant message (optional)")
    fireEvent.input(input, { target: { value: "Test reason" } })

    expect(input).toHaveValue("Test reason")
  })

  it("should call onCancel when the \"Send\" button is clicked", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={player2} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Send"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
