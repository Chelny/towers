export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve: (value: void | PromiseLike<void>) => void) => setTimeout(resolve, ms));
};
