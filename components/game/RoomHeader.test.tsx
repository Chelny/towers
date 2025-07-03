import { render, screen } from "@testing-library/react"
import RoomHeader from "@/components/game/RoomHeader"
import { RoomLevel } from "@/server/towers/classes/Room"

describe("RoomHeader", () => {
  it("should render room name and socket status", () => {
    render(
      <RoomHeader
        room={{
          id: "mock-room-1",
          name: "Test Room",
          level: RoomLevel.SOCIAL,
          isFull: false,
          tables: [],
          users: [],
          chat: { messages: [] },
        }}
      />,
    )

    expect(screen.getByText("Test Room")).toBeInTheDocument()
  })
})
