import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import RoomHeader from "@/components/RoomHeader"
import { socketReducer, SocketState } from "@/redux/features"
import { mockedRoomWithTablesCount } from "@/vitest.setup"

describe("RoomHeader Component", () => {
  it("should render room name and socket status", () => {
    const initialState: SocketState = {
      isConnected: true,
      socketRooms: {},
      rooms: {},
      roomsLoading: false,
      roomsChat: {},
      roomsChatLoading: false,
      roomsUsers: {},
      roomsUsersLoading: false,
      tables: {},
      tablesLoading: false,
      tablesChat: {},
      tablesChatLoading: false,
      tablesUsers: {},
      tablesUsersLoading: false,
      error: undefined,
      loading: false
    }

    const store = configureStore({
      reducer: {
        socket: socketReducer
      },
      preloadedState: {
        socket: initialState
      }
    })

    render(
      <Provider store={store}>
        <RoomHeader room={mockedRoomWithTablesCount} />
      </Provider>
    )

    expect(screen.getByText("Test Room 1")).toBeInTheDocument()
    expect(screen.getByText("Socket status: connected")).toBeInTheDocument()
  })
})
