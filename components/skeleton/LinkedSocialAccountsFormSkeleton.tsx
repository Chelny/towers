import { ReactNode } from "react";
import clsx from "clsx/lite";

export default function LinkedSocialAccountsFormSkeleton(): ReactNode {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      <div className={clsx("w-52 h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      {Array.from({ length: 7 }).map((_, index: number) => (
        <div key={index} className="flex items-center justify-between gap-2">
          <div className={clsx("flex-1 h-6 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
          <div className={clsx("flex-1 h-8 rounded-sm bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
        </div>
      ))}
    </div>
  );
}
