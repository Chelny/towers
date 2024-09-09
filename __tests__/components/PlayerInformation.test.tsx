import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import PlayerInformation from "@/components/PlayerInformation"
import { TowersGameUserWithUserAndTables } from "@/interfaces"

const mockPlayer: TowersGameUserWithUserAndTables = {
  user: { username: "john.doe" },
  rating: 1500,
  gamesCompleted: 10,
  wins: 5,
  loses: 5,
  streak: 3
} as TowersGameUserWithUserAndTables

describe("PlayerInformation Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should display player information correctly when the modal is open", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockPlayer} onCancel={handleCancel} />)

    expect(screen.getByText(/Player information for john\.doe/)).toBeInTheDocument()
    expect(screen.getByText(/Rating: 1500/)).toBeInTheDocument()
    expect(screen.getByText(/Games Completed: 10/)).toBeInTheDocument()
    expect(screen.getByText(/Wins: 5/)).toBeInTheDocument()
    expect(screen.getByText(/Loses: 5/)).toBeInTheDocument()
    expect(screen.getByText(/Streak: 3/)).toBeInTheDocument()
  })

  it("should update the reason input when typed into", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockPlayer} onCancel={handleCancel} />)

    const input: HTMLInputElement = screen.getByLabelText("Send instant message (optional)")
    fireEvent.input(input, { target: { value: "Test reason" } })

    expect(input).toHaveValue("Test reason")
  })

  it("should call onCancel when the \"Send\" button is clicked", () => {
    const handleCancel: Mock = vi.fn()

    render(<PlayerInformation isOpen={true} player={mockPlayer} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText("Send"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
