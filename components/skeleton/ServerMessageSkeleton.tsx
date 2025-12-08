import { ReactNode } from "react";
import clsx from "clsx/lite";

export default function ServerMessageSkeleton(): ReactNode {
  return (
    <div
      className={clsx(
        "flex items-center w-full p-3 animate-pulse",
        "bg-gray-200",
        "dark:bg-dark-skeleton-content-background",
      )}
    >
      <div className={clsx("w-2/3 h-4 bg-gray-300", "dark:bg-dark-skeleton-content-background")} />
    </div>
  );
}
