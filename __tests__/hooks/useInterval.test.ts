import { act } from "react"
import { renderHook } from "@testing-library/react-hooks"
import { useInterval } from "@/hooks"

describe("useInterval Hook", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("should not set up an interval if delay is null", () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, null))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it("should set up an interval and call the callback", () => {
    const callback = vi.fn()
    renderHook(() => useInterval(callback, 1000))

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it("should update the callback without resetting the interval", () => {
    const callback1 = vi.fn()
    const { rerender } = renderHook(({ callback, delay }) => useInterval(callback, delay), {
      initialProps: { callback: callback1, delay: 1000 }
    })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback1).toHaveBeenCalledTimes(1)

    const callback2 = vi.fn()
    rerender({ callback: callback2, delay: 1000 })

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback1).toHaveBeenCalledTimes(1)
    expect(callback2).toHaveBeenCalledTimes(1)
  })

  it("should clear the interval on unmount", () => {
    const callback = vi.fn()
    const { unmount } = renderHook(() => useInterval(callback, 1000))

    unmount()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(callback).not.toHaveBeenCalled()
  })
})
