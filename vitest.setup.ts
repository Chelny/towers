import "@testing-library/jest-dom"

export const mockUseRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

export const mockUseSearchParams = {
  get: vi.fn(),
  getAll: vi.fn(),
  has: vi.fn(),
  toString: vi.fn(),
  keys: vi.fn(),
  values: vi.fn(),
  entries: vi.fn(),
  forEach: vi.fn(),
  append: vi.fn(),
  delete: vi.fn(),
  set: vi.fn(),
  sort: vi.fn(),
  [Symbol.iterator]: vi.fn(),
}

export const mockFetch = (global.fetch = vi.fn())

export const mockFetchResponse = (data: ApiResponse) => {
  return {
    json: () => new Promise((resolve: (value: unknown) => void) => resolve(data)),
  }
}
