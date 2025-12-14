export const mockFetch = (global.fetch = vi.fn());

export const mockFetchResponse = (data: ApiResponse) => {
  return {
    json: () => new Promise((resolve: (value: unknown) => void) => resolve(data)),
  };
};
