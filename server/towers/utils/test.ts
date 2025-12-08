export const isTestMode = (): boolean => {
  return process.env.NODE_ENV === "development" && process.env.TEST_MODE === "true";
};
