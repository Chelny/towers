import { render, screen } from "@testing-library/react"
import {
  mockTowersRoomState1Chat,
  mockTowersTableState11Chat,
  mockTowersTableState11Users,
} from "@/__mocks__/data/socketState"
import Chat from "@/components/game/Chat"

describe("Chat Component", () => {
  const userId: string = mockTowersTableState11Users[0].userProfile.userId

  it("should render room chat messages correctly", () => {
    render(<Chat messages={mockTowersRoomState1Chat} />)

    expect(
      screen.getByText(
        `${mockTowersRoomState1Chat[0].userProfile.user.username}: ${mockTowersRoomState1Chat[0].message}`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${mockTowersRoomState1Chat[1].userProfile.user.username}: ${mockTowersRoomState1Chat[1].message}`,
      ),
    ).toBeInTheDocument()
  })

  it("should handle an empty message array without crashing", () => {
    render(<Chat messages={[]} />)

    expect(screen.queryByText(/:/)).not.toBeInTheDocument()
  })

  it("should render messages in the order they are provided", () => {
    render(<Chat userId={userId} messages={mockTowersTableState11Chat} />)

    const messages = screen.getAllByText(/Hey!|Wazzup?/)
    expect(messages[0].textContent).toContain(mockTowersTableState11Chat[2].message)
    expect(messages[1].textContent).toContain(mockTowersTableState11Chat[3].message)
  })

  it("should render table chat messages correctly for a specific user", () => {
    render(<Chat messages={mockTowersTableState11Chat} userId={userId} />)

    expect(screen.getByText(`${mockTowersTableState11Chat[0].message}`)).toBeInTheDocument()
    expect(screen.queryByText(`${mockTowersTableState11Chat[1].message}`)).not.toBeInTheDocument()
    expect(
      screen.getByText(
        `${mockTowersTableState11Chat[2].userProfile?.user.username}: ${mockTowersTableState11Chat[2].message}`,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `${mockTowersTableState11Chat[3].userProfile?.user.username}: ${mockTowersTableState11Chat[3].message}`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(`${mockTowersTableState11Chat[4].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockTowersTableState11Chat[5].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockTowersTableState11Chat[6].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockTowersTableState11Chat[7].message}`)).toBeInTheDocument()
    expect(screen.getByText(`${mockTowersTableState11Chat[8].message}`)).toBeInTheDocument()
  })
})
