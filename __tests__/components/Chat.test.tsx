import { render, screen } from "@testing-library/react"
import Chat from "@/components/Chat"
import { RoomChatWithTowersGameUser, TableChatWithTowersGameUser } from "@/interfaces"

describe("Chat Component", () => {
  it("should render room chat messages correctly", () => {
    const roomMessages: RoomChatWithTowersGameUser[] = [
      { towersGameUser: { user: { username: "Alice" } }, message: "Hello" },
      { towersGameUser: { user: { username: "Bob" } }, message: "Hi" }
    ] as RoomChatWithTowersGameUser[]

    render(<Chat messages={roomMessages} />)

    expect(screen.getByText("Alice: Hello")).toBeInTheDocument()
    expect(screen.getByText("Bob: Hi")).toBeInTheDocument()
  })

  it("should render table chat messages correctly when isTableChat is true", () => {
    const tableMessages = [
      { towersGameUser: { user: { username: "Charlie" } }, message: "Ready to play" },
      { towersGameUser: { user: { username: "David" } }, message: "Let's go" }
    ] as TableChatWithTowersGameUser[]

    render(<Chat messages={tableMessages} isTableChat />)

    expect(screen.getByText("Charlie: Ready to play")).toBeInTheDocument()
    expect(screen.getByText("David: Let's go")).toBeInTheDocument()
  })

  it("should handle an empty message array without crashing", () => {
    render(<Chat messages={[]} />)

    expect(screen.queryByText(/:/)).not.toBeInTheDocument()
  })
})
