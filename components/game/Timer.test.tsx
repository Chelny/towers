import { act } from "react"
import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import Timer from "@/components/game/Timer"

describe("Timer Component", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should display the initial time as \"--:--\"", () => {
    render(<Timer isActive={false} />)
    expect(screen.getByText("--:--")).toBeInTheDocument()
  })

  it("should start the timer when isActive is true", () => {
    render(<Timer isActive={true} />)

    expect(screen.getByText("00:00")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText("00:03")).toBeInTheDocument()
  })

  it("should stop the timer when isActive is false", () => {
    const { rerender } = render(<Timer isActive={true} />)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText("00:05")).toBeInTheDocument()

    rerender(<Timer isActive={false} />)

    expect(screen.getByText("00:05")).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText("00:05")).toBeInTheDocument()
  })

  it("should reset the timer when isActive changes from false to true", () => {
    const { rerender } = render(<Timer isActive={false} />)

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.getByText("--:--")).toBeInTheDocument()

    rerender(<Timer isActive={true} />)

    expect(screen.getByText("00:00")).toBeInTheDocument()
  })

  it("should display formatted time correctly", () => {
    render(<Timer isActive={true} />)

    act(() => {
      vi.advanceTimersByTime(65000) // 65 seconds
    })

    expect(screen.getByText("01:05")).toBeInTheDocument()
  })
})
