import { useFormState, useFormStatus } from "react-dom"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import "@testing-library/jest-dom"
import { useSessionData } from "@/hooks"

export const mockUseSearchParams = (params: Record<string, string | string[]>): ReadonlyURLSearchParams => {
  const urlSearchParams = new URLSearchParams("")

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((val) => urlSearchParams.append(key, val))
    } else {
      urlSearchParams.set(key, value)
    }
  })

  return {
    get: (name: string) => urlSearchParams.get(name),
    getAll: (name: string) => urlSearchParams.getAll(name),
    has: (name: string) => urlSearchParams.has(name),
    toString: () => urlSearchParams.toString(),
    keys: () => urlSearchParams.keys(),
    values: () => urlSearchParams.values(),
    entries: () => urlSearchParams.entries(),
    forEach: urlSearchParams.forEach.bind(urlSearchParams),
    // append: (name: string, value: string) => urlSearchParams.append(name, value),
    // delete: (name: string, value?: string) => urlSearchParams.delete(name, value),
    // set: (name: string, value: string) => urlSearchParams.set(name, value),
    append: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    sort: () => urlSearchParams.sort(),
    size: urlSearchParams.size,
    // [Symbol.iterator]: () => urlSearchParams[Symbol.iterator]()
    [Symbol.iterator]: urlSearchParams[Symbol.iterator].bind(urlSearchParams)
  }
}

vi.mock("react-dom", () => ({
  useFormState: vi.fn(),
  useFormStatus: vi.fn()
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn()
}))

vi.mock("@/hooks", () => ({
  useSessionData: vi.fn()
}))

beforeEach(() => {
  const mockRouter = {
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }
  vi.mocked(useRouter).mockReturnValue(mockRouter)

  vi.mocked(useSearchParams).mockReturnValue(mockUseSearchParams({}))

  vi.mocked(useFormState).mockReturnValue([{ success: false, message: "", errors: {} }, vi.fn(), false])

  vi.mocked(useFormStatus).mockReturnValue({
    pending: false,
    data: null,
    method: null,
    action: null
  })

  vi.mocked(useSessionData).mockReturnValue({
    status: "unauthenticated",
    data: null,
    update: vi.fn()
  })
})

afterEach(() => {
  vi.clearAllMocks()
})
