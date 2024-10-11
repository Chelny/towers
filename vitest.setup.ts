import "@testing-library/jest-dom"

export const mockRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn()
}

export const mockFormInitialState = {
  success: false,
  message: "",
  error: {}
}
