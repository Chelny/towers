import { act } from "react"
import { render, screen } from "@testing-library/react"
import JoiningScreen from "./JoiningScreen"

vi.mock("@lingui/react/macro", () => ({
  useLingui: () => ({
    t: (message: { message: string }) => message.message,
  }),
}))

describe("JoiningScreen", () => {
  const mockProps = {
    title: "Joining Game",
    subtitle: "Please wait while we connect you",
    isDone: false,
    onCancel: vi.fn(),
  }

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it("should render correctly with initial props", () => {
    render(<JoiningScreen {...mockProps} />)

    expect(screen.getByText("Joining Game")).toBeInTheDocument()
    expect(screen.getByText("Please wait while we connect you")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
    expect(screen.getByTestId("joining-screen_cancel_button")).toBeInTheDocument()
  })

  it("should display the progress bar with correct initial state", () => {
    render(<JoiningScreen {...mockProps} />)

    const progressBar: HTMLDivElement = screen.getByTestId("joining-screen_progress-bar")
    const filledBlocks: HTMLDivElement[] = screen.queryAllByTestId(/_progress-filled$/)
    const emptyBlocks: HTMLDivElement[] = screen.queryAllByTestId(/_progress-empty$/)

    expect(progressBar).toBeInTheDocument()
    expect(filledBlocks).toHaveLength(0)
    expect(emptyBlocks).toHaveLength(20)
  })

  it("should update progress when isDone is false", () => {
    render(<JoiningScreen {...mockProps} />)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    const filledBlocks: HTMLDivElement[] = screen.queryAllByTestId(/_progress-filled$/)

    expect(filledBlocks.length).toBeGreaterThan(0)
    expect(filledBlocks.length).toBeLessThanOrEqual(20)
  })

  it("should stop at 95% when isDone is false", () => {
    render(<JoiningScreen {...mockProps} />)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    const filledBlocks: HTMLDivElement[] = screen.queryAllByTestId(/_progress-filled$/)

    expect(filledBlocks.length).toBeGreaterThanOrEqual(18) // 95% of 20 blocks
    expect(filledBlocks.length).toBeLessThan(20)
  })

  it("should reach 100% when isDone is true", () => {
    render(<JoiningScreen {...mockProps} isDone={true} />)

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    const filledBlocks: HTMLDivElement[] = screen.queryAllByTestId(/_progress-filled$/)

    expect(filledBlocks.length).toBe(20)
  })

  it("should call onCancel when button is clicked", () => {
    render(<JoiningScreen {...mockProps} />)

    act(() => {
      screen.getByTestId("joining-screen_cancel_button").click()
    })

    expect(mockProps.onCancel).toHaveBeenCalledTimes(1)
  })
})
