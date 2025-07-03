import { JSX } from "react"
import { fireEvent, render } from "@testing-library/react"
import { Mock, vi } from "vitest"
import TableInvitationModal from "@/components/game/TableInvitationModal"
import { SocketEvents } from "@/constants/socket-events"
import { TableType } from "@/enums/table-type"
import { authClient } from "@/lib/auth-client"
import { GamePlainObject } from "@/server/towers/classes/Game"
import { TablePlainObject } from "@/server/towers/classes/Table"
import { TableInvitationPlainObject } from "@/server/towers/classes/TableInvitation"
import { UserPlainObject } from "@/server/towers/classes/User"
import { mockSession } from "@/test/data/session"
import { mockUser1, mockUser2 } from "@/test/data/user"
import { mockUserStats2 } from "@/test/data/user-stats"
import { mockSocket, customScreen as screen } from "@/vitest.setup"

vi.mock("@/context/SocketContext", async () => {
  const actual = await vi.importActual("@/context/SocketContext")
  return {
    ...actual,
    useSocket: () => ({ socket: mockSocket }),
  }
})

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: vi.fn(),
  },
}))

const mockRoomId: string = "mock-room-1"

const mockTable: TablePlainObject = {
  id: "mock-table-1",
  tableNumber: 5,
  host: {} as UserPlainObject,
  tableType: TableType.PUBLIC,
  isRated: true,
  seats: [],
  users: [],
  usersToInvite: [],
  usersToBoot: [],
  chat: { messages: [] },
  game: {} as GamePlainObject,
}

const mockFromUser: UserPlainObject = {
  user: mockUser2,
  stats: mockUserStats2,
} as UserPlainObject

const mockToUser: UserPlainObject = {
  user: mockUser1,
} as UserPlainObject

const mockTableInvitation: TableInvitationPlainObject = {
  id: "mock-table-invitation-1",
  roomId: mockRoomId,
  tableId: mockTable.id,
  tableNumber: mockTable.tableNumber,
  tableIsRated: mockTable.isRated,
  inviterUserId: mockFromUser.user?.id,
  inviterUsername: mockFromUser.user?.username,
  inviterRating: mockFromUser.stats.rating,
  inviteeUserId: mockToUser.user?.id,
} as TableInvitationPlainObject

describe("TableInvitationModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    vi.mocked(authClient.useSession).mockReturnValue(mockSession)
  })

  const renderWithContext = (
    props: JSX.IntrinsicAttributes & {
      tableInvitation: TableInvitationPlainObject
      onAcceptInvitation: (roomId: string, tableId: string) => void
      onCancel: () => void
    },
  ) => render(<TableInvitationModal {...props} />)

  it("should render the invitation details", () => {
    const mockHandleAcceptInvitation: Mock = vi.fn()
    const mockHandleCancel: Mock = vi.fn()

    renderWithContext({
      tableInvitation: mockTableInvitation,
      onAcceptInvitation: mockHandleAcceptInvitation,
      onCancel: mockHandleCancel,
    })

    expect(screen.getByText(/janesmith \(1200\).*table #5/i)).toBeInTheDocument()
    expect(screen.getByText(/game option.*rated/i)).toBeInTheDocument()
    expect(screen.getByText(/would you like to join/i)).toBeInTheDocument()
  })

  it("should handle invitation acceptance", () => {
    const mockHandleAcceptInvitation: Mock = vi.fn()
    const mockHandleCancel: Mock = vi.fn()

    renderWithContext({
      tableInvitation: mockTableInvitation,
      onAcceptInvitation: mockHandleAcceptInvitation,
      onCancel: mockHandleCancel,
    })

    fireEvent.click(screen.getByText("Accept"))

    expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.TABLE_INVITATION_ACCEPTED, {
      roomId: mockRoomId,
      tableId: mockTable.id,
      inviteeUserId: mockToUser.user?.id,
    })

    expect(mockHandleAcceptInvitation).toHaveBeenCalledWith(mockRoomId, mockTable.id)
    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should handle invitation decline", () => {
    const mockHandleAcceptInvitation: Mock = vi.fn()
    const mockHandleCancel: Mock = vi.fn()

    renderWithContext({
      tableInvitation: mockTableInvitation,
      onAcceptInvitation: mockHandleAcceptInvitation,
      onCancel: mockHandleCancel,
    })

    fireEvent.click(screen.getByText("Decline"))

    expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.TABLE_INVITATION_DECLINED, {
      roomId: mockTableInvitation.roomId,
      tableId: mockTableInvitation.tableId,
      inviteeUserId: mockToUser.user?.id,
    })

    expect(mockHandleCancel).toHaveBeenCalled()
  })

  it("should handle invitation decline with a reason", () => {
    const mockHandleAcceptInvitation: Mock = vi.fn()
    const mockHandleCancel: Mock = vi.fn()

    renderWithContext({
      tableInvitation: mockTableInvitation,
      onAcceptInvitation: mockHandleAcceptInvitation,
      onCancel: mockHandleCancel,
    })

    fireEvent.input(screen.getByTestId("table-invitation_input-text_reason"), {
      target: { value: "I'm busy right now" },
    })
    fireEvent.click(screen.getByText("Decline"))

    expect(mockSocket.emit).toHaveBeenCalledWith(SocketEvents.TABLE_INVITATION_DECLINED, {
      roomId: mockTableInvitation.roomId,
      tableId: mockTableInvitation.tableId,
      inviteeUserId: mockToUser.user?.id,
      reason: "I'm busy right now",
    })

    expect(mockHandleCancel).toHaveBeenCalled()
  })
})
