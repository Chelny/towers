import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import {
  mockRoom1Table1TowersUserProfile1,
  mockRoom1Table1TowersUserProfile2
} from "@/__mocks__/data/towersUserProfiles"
import { mockAuthenticatedSession } from "@/__mocks__/data/users"
import PlayerInformation from "@/components/game/PlayerInformation"
import { useSessionData } from "@/hooks/useSessionData"

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("PlayerInformation Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useSessionData).mockReturnValue(mockAuthenticatedSession)
  })

  it("should hide message input and \"Send\" button when viewing current user's information", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockRoom1Table1TowersUserProfile1} onCancel={handleCancel} />)

    expect(screen.queryByLabelText("Send instant message (optional)")).not.toBeInTheDocument()
    expect(screen.queryByText("Send")).not.toBeInTheDocument()
  })

  it("should display player information correctly when the modal is open", () => {
    const handleCancel: Mock = vi.fn()

    render(
      <PlayerInformation
        isOpen={true}
        player={mockRoom1Table1TowersUserProfile2}
        isRatingsVisible
        onCancel={handleCancel}
      />
    )

    expect(
      screen.getByText(`Player information of ${mockRoom1Table1TowersUserProfile2.user.username}`)
    ).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Rating: ${mockRoom1Table1TowersUserProfile2.rating}`))).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`Games Completed: ${mockRoom1Table1TowersUserProfile2.gamesCompleted}`))
    ).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Wins: ${mockRoom1Table1TowersUserProfile2.wins}`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Loses: ${mockRoom1Table1TowersUserProfile2.loses}`))).toBeInTheDocument()
    expect(screen.getByText(new RegExp(`Streak: ${mockRoom1Table1TowersUserProfile2.streak}`))).toBeInTheDocument()
  })

  it("should update the reason input when typed into", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockRoom1Table1TowersUserProfile2} onCancel={handleCancel} />)

    const input: HTMLInputElement = screen.getByLabelText("Send instant message (optional)")
    fireEvent.input(input, { target: { value: "Test reason" } })

    expect(input).toHaveValue("Test reason")
  })

  it("should call onCancel when the \"Send\" button is clicked", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockRoom1Table1TowersUserProfile2} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Send"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
