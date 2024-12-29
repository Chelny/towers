import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import RoomHeader from "@/components/game/RoomHeader"
import { SocketState } from "@/interfaces/socket"
import socketReducer from "@/redux/features/socket-slice"
import { mockRoom1 } from "@/test/data/rooms"
import { mockSocketInitialState, mockTowersRoomState1Info } from "@/test/data/socketState"

const initialState: SocketState = {
  ...mockSocketInitialState,
  isConnected: true,
}

const store = configureStore({
  reducer: {
    socket: socketReducer,
  },
  preloadedState: {
    socket: initialState,
  },
})

describe("RoomHeader Component", () => {
  it("should render room name and socket status", () => {
    render(
      <Provider store={store}>
        <RoomHeader room={mockTowersRoomState1Info} />
      </Provider>,
    )

    expect(screen.getByText(mockRoom1.name)).toBeInTheDocument()
  })
})
