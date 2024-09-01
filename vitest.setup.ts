import { ReadonlyURLSearchParams } from "next/navigation"
import "@testing-library/jest-dom"

export const mockUseSearchParams = (params: Record<string, string | string[]>): ReadonlyURLSearchParams => {
  const urlSearchParams = new URLSearchParams()

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
    append: vi.fn(),
    delete: vi.fn(),
    set: vi.fn(),
    sort: () => urlSearchParams.sort(),
    size: urlSearchParams.size,
    [Symbol.iterator]: urlSearchParams[Symbol.iterator].bind(urlSearchParams)
  }
}
