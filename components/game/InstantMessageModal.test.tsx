import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import { InstantMessagePlainObject } from "@/server/towers/classes/InstantMessage"
import { UserPlainObject } from "@/server/towers/classes/User"
import { mockSocket } from "@/test/data/socket"
import { mockUser1, mockUser2 } from "@/test/data/user"
import { mockUserStats1, mockUserStats2 } from "@/test/data/user-stats"
import InstantMessageModal from "./InstantMessageModal"

const mockInstantMessage: InstantMessagePlainObject = {
  id: "mock-instant-message",
  roomId: "mock-room-1",
  sender: {
    user: mockUser1,
    stats: mockUserStats1,
  } as UserPlainObject,
  recipient: {
    user: mockUser2,
    stats: mockUserStats2,
  } as UserPlainObject,
  message: "Hello there!",
  createdAt: new Date("2000-01-01T12:00:00Z").getTime(),
}

describe("InstantMessageModal", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it("should render the modal with message and sender info", () => {
    render(<InstantMessageModal instantMessage={mockInstantMessage} onCancel={() => {}} />)

    expect(screen.getByText("Hello there!")).toBeInTheDocument()
    expect(screen.getByText(/Instant message from john\.doe \(2550\)/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Reply to john\.doe/)).toBeInTheDocument()
  })

  it("should update message input and call socket emit on reply", () => {
    const handleCancel: Mock = vi.fn()

    render(<InstantMessageModal instantMessage={mockInstantMessage} onCancel={handleCancel} />)

    const input: HTMLInputElement = screen.getByLabelText(/Reply to john\.doe/) as HTMLInputElement
    fireEvent.input(input, { target: { value: "Hey! Wanna play?" } })
    expect(input.value).toBe("Hey! Wanna play?")

    const mockCallback: Mock = vi.fn((_, __, cb) => cb({ success: true }))
    mockSocket.current.emit = mockCallback

    const replyButton: HTMLElement = screen.getByText("Reply")
    fireEvent.click(replyButton)

    expect(mockCallback).toHaveBeenCalled()
    expect(handleCancel).toHaveBeenCalled()
  })
})
