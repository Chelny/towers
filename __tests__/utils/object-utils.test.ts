import { Mock } from "vitest"
import { debounce, removeNullUndefined } from "@/utils"

describe("debounce Utility", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it("should call the debounced function after the specified delay", () => {
    const mockedFunction: Mock = vi.fn()
    const debouncedFunction: Debounce = debounce(mockedFunction, 1000)

    debouncedFunction()
    expect(mockedFunction).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1000)
    expect(mockedFunction).toHaveBeenCalled()
  })

  it("should not call the debounced function multiple times if called frequently", () => {
    const mockedFunction: Mock = vi.fn()
    const debouncedFunction: Debounce = debounce(mockedFunction, 500)

    debouncedFunction()
    debouncedFunction()
    debouncedFunction()

    vi.advanceTimersByTime(500)
    expect(mockedFunction).toHaveBeenCalledTimes(1)
  })

  it("should pass arguments to the debounced function", () => {
    const mockedFunction: Mock = vi.fn()
    const debouncedFunction: Debounce = debounce(mockedFunction, 1000)

    debouncedFunction(1, "test")
    vi.advanceTimersByTime(1000)

    expect(mockedFunction).toHaveBeenCalledWith(1, "test")
  })
})

describe("removeNullUndefined Utility", () => {
  it("should remove null and undefined values from an object", () => {
    type ObjProps = {
      a: number
      b: number
      c: null
      d: undefined
      e: string
      f: string
    }
    const obj: ObjProps = { a: 0, b: 1, c: null, d: undefined, e: "", f: "test" }
    const result: NonNullableObject<ObjProps> = removeNullUndefined(obj)
    expect(result).toEqual({ a: 0, b: 1, e: "", f: "test" })
  })

  it("should handle an empty object", () => {
    type ObjProps = {}
    const obj: ObjProps = {}
    const result: NonNullableObject<ObjProps> = removeNullUndefined(obj)
    expect(result).toEqual(obj)
  })
})
