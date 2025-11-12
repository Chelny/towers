export const isTestMode = (): boolean => {
  return process.env.TEST_MODE === "true" && process.env.NODE_ENV === "development";
};
