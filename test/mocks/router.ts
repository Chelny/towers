export const mockUseRouter = {
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
};

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
};
