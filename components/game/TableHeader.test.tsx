import { render, screen } from "@testing-library/react"
import TableHeader from "@/components/game/TableHeader"
import { TableType } from "@/enums/table-type"
import { GamePlainObject } from "@/server/towers/classes/Game"
import { RoomLevel } from "@/server/towers/classes/Room"
import { UserPlainObject } from "@/server/towers/classes/User"

describe("TableHeader", () => {
  const mockRoom = {
    id: "mock-room-1",
    name: "Test Room",
    level: RoomLevel.SOCIAL,
    isFull: false,
    tables: [],
    users: [],
    chat: { messages: [] },
  }

  const mockTable = {
    id: "mock-table-1",
    tableNumber: 5,
    host: { user: { username: "john.doe" } } as UserPlainObject,
    tableType: TableType.PUBLIC,
    isRated: true,
    seats: [],
    users: [],
    usersToInvite: [],
    usersToBoot: [],
    chat: { messages: [] },
    game: {} as GamePlainObject,
  }

  it("should render the table number and host username", () => {
    render(<TableHeader room={mockRoom} table={mockTable} />)

    expect(
      screen.getByText(`Table: ${mockTable?.tableNumber} - Host: ${mockTable?.host?.user?.username}`),
    ).toBeInTheDocument()
    expect(screen.getByText(mockRoom?.name!)).toBeInTheDocument()
  })
})
