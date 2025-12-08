import type { ReactElement } from "react";

export type AuthProvider = "github" | "google";

export type AuthProviderDetails = {
  name: AuthProvider
  label: string
  icon: ReactElement
};
