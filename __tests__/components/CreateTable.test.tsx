import { TableType, TowersTable } from "@prisma/client"
import { configureStore } from "@reduxjs/toolkit"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import axios, { AxiosStatic } from "axios"
import { Provider } from "react-redux"
import { Mock, Mocked } from "vitest"
import { mockRoom1 } from "@/__mocks__/data/rooms"
import { mockSocketInitialState, mockSocketRoom1Id } from "@/__mocks__/data/socketState"
import { mockRoom1Table1TowersUserProfile1 } from "@/__mocks__/data/towersUserProfiles"
import CreateTable from "@/components/game/CreateTable"
import { SocketState } from "@/interfaces/socket"
import socketReducer from "@/redux/features/socket-slice"

vi.mock("axios")

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

describe("CreateTable Component", () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it("should render the modal with correct default values when opened", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(
      <Provider store={store}>
        <CreateTable
          isOpen={true}
          roomId={mockSocketRoom1Id}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </Provider>
    )

    expect(screen.getByText("Create Table")).toBeInTheDocument()
    expect(screen.getByLabelText("Table Type")).toBeInTheDocument()
    expect(screen.getByLabelText("Rated Game")).toBeChecked()
  })

  it("should update table type when selecting a new option", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(
      <Provider store={store}>
        <CreateTable
          isOpen={true}
          roomId={mockSocketRoom1Id}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </Provider>
    )

    fireEvent.click(screen.getByRole("combobox", { hidden: true }))
    fireEvent.click(
      screen.getByText((_: string, element: Element | null) => {
        return element?.textContent === "Private"
      })
    )

    expect(screen.getByDisplayValue(TableType.PRIVATE)).toBeInTheDocument()
  })

  it("should call onSubmitSuccess when the Create button is clicked", async () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()
    const mockAxios: Mocked<AxiosStatic> = axios as Mocked<typeof axios>
    const mockTable: TowersTable = {
      id: "99567d42-01cd-4a08-aa1d-95e7734a400a",
      roomId: mockRoom1.id,
      tableNumber: 4,
      hostId: mockRoom1Table1TowersUserProfile1.id,
      tableType: TableType.PROTECTED,
      rated: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    mockAxios.post.mockResolvedValue({ status: 201, data: { data: mockTable } })

    render(
      <Provider store={store}>
        <CreateTable
          isOpen={true}
          roomId={mockSocketRoom1Id}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </Provider>
    )

    fireEvent.click(screen.getByLabelText(/Table Type/i))
    fireEvent.click(screen.getByText(/PROTECTED/i))
    fireEvent.click(screen.getByLabelText(/Rated Game/i))
    fireEvent.click(screen.getByText("Create"))

    await waitFor(() => expect(handleSubmitSuccess).toHaveBeenCalledWith(mockTable))
  })

  it("should call onCancel when cancel button is clicked", () => {
    const handleSubmitSuccess: Mock = vi.fn()
    const handleCancel: Mock = vi.fn()

    render(
      <Provider store={store}>
        <CreateTable
          isOpen={true}
          roomId={mockSocketRoom1Id}
          onSubmitSuccess={handleSubmitSuccess}
          onCancel={handleCancel}
        />
      </Provider>
    )

    fireEvent.click(screen.getByText("Cancel"))

    expect(handleCancel).toHaveBeenCalled()
  })
})
