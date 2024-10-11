import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import { mockSocketInitialState, mockSocketRoom1Id, mockSocketStateRooms } from "@/__mocks__/data/socketState"
import RoomHeader from "@/components/game/RoomHeader"
import socketReducer, { SocketState } from "@/redux/features/socket-slice"

const initialState: SocketState = {
  ...mockSocketInitialState,
  isConnected: true
}

const store = configureStore({
  reducer: {
    socket: socketReducer
  },
  preloadedState: {
    socket: initialState
  }
})

describe("RoomHeader Component", () => {
  it("should render room name and socket status", () => {
    render(
      <Provider store={store}>
        <RoomHeader room={mockSocketStateRooms[mockSocketRoom1Id].roomInfo} />
      </Provider>
    )

    expect(screen.getByText(mockRoom1.name)).toBeInTheDocument()
  })
})
