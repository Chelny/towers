import { RoomMessage, TableMessage } from "@prisma/client"
import { render, screen } from "@testing-library/react"
import Chat from "@/components/game/Chat"

describe("Chat Component", () => {
  it("should render room chat messages correctly", () => {
    const roomMessages: RoomMessage[] = [
      { towersUserProfile: { user: { username: "Alice" } }, message: "Hello" },
      { towersUserProfile: { user: { username: "Bob" } }, message: "Hi" }
    ] as RoomMessage[]

    render(<Chat messages={roomMessages} />)

    expect(screen.getByText("Alice: Hello")).toBeInTheDocument()
    expect(screen.getByText("Bob: Hi")).toBeInTheDocument()
  })

  it("should render table chat messages correctly when isTableChat is true", () => {
    const tableMessages = [
      { towersUserProfile: { user: { username: "Charlie" } }, message: "Ready to play" },
      { towersUserProfile: { user: { username: "David" } }, message: "Let’s go" }
    ] as TableMessage[]

    render(<Chat messages={tableMessages} isTableChat />)

    expect(screen.getByText("Charlie: Ready to play")).toBeInTheDocument()
    expect(screen.getByText("David: Let’s go")).toBeInTheDocument()
  })

  it("should handle an empty message array without crashing", () => {
    render(<Chat messages={[]} />)

    expect(screen.queryByText(/:/)).not.toBeInTheDocument()
  })
})
