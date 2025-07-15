import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock } from "vitest"
import RoomTable from "@/components/game/RoomTable"
import { ROUTE_TOWERS } from "@/constants/routes"
import { TableType } from "@/enums/table-type"
import { GamePlainObject } from "@/server/towers/classes/Game"
import { TablePlainObject } from "@/server/towers/classes/Table"
import { TableInvitationManagerPlainObject } from "@/server/towers/classes/TableInvitationManager"
import { UserMuteManagerPlainObject } from "@/server/towers/classes/UserMuteManager"
import { mockJoinedRooms } from "@/test/data/room"
import { mockJoinedTables1, mockLastJoinedTable1 } from "@/test/data/table"
import { mockUser1 } from "@/test/data/user"
import { mockUserControlKeys1 } from "@/test/data/user-control-keys"
import { mockUserStats1 } from "@/test/data/user-stats"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}))

describe("RoomTable", () => {
  const mockRoomId: string = "mock-room-1"
  const mockTable: TablePlainObject = {
    id: "mock-table-1",
    tableNumber: 5,
    tableType: TableType.PUBLIC,
    isRated: true,
    host: {
      user: mockUser1,
      rooms: mockJoinedRooms,
      tables: mockJoinedTables1,
      lastJoinedTable: mockLastJoinedTable1,
      controlKeys: mockUserControlKeys1,
      stats: mockUserStats1,
      tableInvitations: {} as TableInvitationManagerPlainObject,
      mute: {} as UserMuteManagerPlainObject,
    },
    users: [],
    usersToInvite: [],
    usersToBoot: [],
    seats: [],
    chat: { messages: [] },
    game: {} as GamePlainObject,
  }

  it("should render room tables correctly", () => {
    render(<RoomTable roomId={mockRoomId} table={mockTable} />)
    expect(screen.getByText("#5")).toBeInTheDocument()
  })

  it("should navigate to the correct table on watch button click", async () => {
    const mockPush: Mock = vi.fn()
    mockUseRouter.push = mockPush

    render(<RoomTable roomId={mockRoomId} table={mockTable} />)

    await waitFor(() => {
      const watchButtons: HTMLButtonElement[] = screen.getAllByRole("button", { name: /Watch/i })
      const watchButton: HTMLElement | undefined = watchButtons.at(0)
      fireEvent.click(watchButton!)
      expect(mockPush).toHaveBeenCalledWith(`${ROUTE_TOWERS.PATH}?room=${mockRoomId}&table=${mockTable.id}`)
    })
  })
})
