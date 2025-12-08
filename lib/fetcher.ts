export const fetcher = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const { method = "GET", body, headers = {} } = options;

  const response: Response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body ? { body } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    const error: Error = new Error(data?.message || `Fetcher HTTP error: ${response.status}`) as Error & {
      status?: number
    };
    // @ts-ignore
    error.status = response.status;
    throw error;
  }

  return data;
};
