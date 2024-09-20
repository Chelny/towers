import { fireEvent, render, screen } from "@testing-library/react"
import { useDispatch, useSelector } from "react-redux"
import { Mock } from "vitest"
import Room from "@/components/Room"
import { ROUTE_ROOMS } from "@/constants"
import { useSessionData } from "@/hooks/useSessionData"
import { SocketState } from "@/redux/features"
import {
  mockedAuthenticatedSession,
  mockedRoom1,
  mockedRoom1Chat,
  mockedRoom1Info,
  mockedRoom1Users
} from "@/vitest.setup"

const { useRouter, mockedRouterPush } = vi.hoisted(() => {
  const mockedRouterPush: Mock = vi.fn()

  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush
  }
})

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual("next/navigation")

  return {
    ...actual,
    useRouter
  }
})

vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn()
}))

vi.mock("@/hooks/useSessionData", () => ({
  useSessionData: vi.fn()
}))

describe("Room Component", () => {
  const mockedDispatch: Mock = vi.fn()

  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  beforeEach(() => {
    vi.mocked(useDispatch).mockReturnValue(mockedDispatch)
    vi.mocked(useSessionData).mockReturnValue(mockedAuthenticatedSession)
    vi.mocked(useSelector).mockImplementation((selectorFn: (_: SocketState) => unknown) => {
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.roomInfo")) {
        return mockedRoom1Info
      }
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.isRoomInfoLoading")) {
        return false
      }
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.chat")) {
        return mockedRoom1Chat
      }
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.isChatLoading")) {
        return false
      }
      if (selectorFn.toString().includes("state.socket.rooms[roomId]?.users")) {
        return mockedRoom1Users
      }
      if (selectorFn.toString().includes("state.socket.errorMessage")) {
        return undefined
      }
      return undefined
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render room correctly", () => {
    render(<Room roomId={mockedRoom1.id} />)

    expect(screen.getByPlaceholderText("Write something...")).toBeInTheDocument()
  })

  it("should send a message when Enter is pressed", () => {
    render(<Room roomId={mockedRoom1.id} />)

    const input: HTMLInputElement = screen.getByPlaceholderText("Write something...")
    fireEvent.change(input, { target: { value: "Hello World!" } })
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" })

    expect(mockedDispatch).toHaveBeenCalled()
  })

  it("should navigate to rooms list on exit", () => {
    render(<Room roomId={mockedRoom1.id} />)

    const exitRoomButton: HTMLButtonElement = screen.getByText("Exit Room")
    fireEvent.click(exitRoomButton)

    expect(mockedRouterPush).toHaveBeenCalledWith(ROUTE_ROOMS.PATH)
  })
})
