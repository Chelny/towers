import { configureStore } from "@reduxjs/toolkit"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import RoomHeader from "@/components/RoomHeader"
import socketReducer, { SocketState } from "@/redux/features"
import { mockedRoom1, mockedSocketInitialState, mockedSocketRoom1Id, mockedSocketStateRooms } from "@/vitest.setup"

const initialState: SocketState = {
  ...mockedSocketInitialState,
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
        <RoomHeader room={mockedSocketStateRooms[mockedSocketRoom1Id].roomInfo} />
      </Provider>
    )

    expect(screen.getByText(mockedRoom1.name)).toBeInTheDocument()
    expect(screen.getByText("Socket status: connected")).toBeInTheDocument()
  })
})
