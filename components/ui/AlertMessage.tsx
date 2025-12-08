"use client";

import { PropsWithChildren, ReactNode } from "react";
import clsx from "clsx/lite";

type AlertMessageProps = PropsWithChildren<{
  type?: "info" | "warning" | "success" | "error"
}>;

export default function AlertMessage({ children, type }: AlertMessageProps): ReactNode {
  return (
    <div
      className={clsx(
        "p-2 mb-2 border border-gray-200 font-medium",
        typeof type === "undefined" && "border-gray-200 bg-gray-100 text-transparent",
        type === "info" && "border-sky-200 bg-sky-100 text-sky-600",
        type === "warning" && "border-amber-200 bg-amber-100 text-amber-600",
        type === "success" && "border-emerald-200 bg-emerald-100 text-emerald-600",
        type === "error" && "border-red-200 bg-red-100 text-red-600",
        typeof type === "undefined" &&
          "dark:border-dark-alert-message-border dark:bg-dark-alert-message-background dark:text-dark-alert-message-text",
        type === "info" && "dark:border-dark-info-border dark:bg-dark-info-background dark:text-dark-info-text",
        type === "warning" &&
          "dark:border-dark-warning-border dark:bg-dark-warning-background dark:text-dark-warning-text",
        type === "success" &&
          "dark:border-dark-success-border dark:bg-dark-success-background dark:text-dark-success-text",
        type === "error" && "dark:border-dark-error-border dark:bg-dark-error-background dark:text-dark-error-text",
      )}
      role="alert"
      aria-live="assertive"
    >
      {children}
    </div>
  );
}
