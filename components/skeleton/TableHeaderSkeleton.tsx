import { ReactNode } from "react";
import clsx from "clsx/lite";
import BannerSkeleton from "@/components/skeleton/BannerSkeleton";

export default function TableHeaderSkeleton(): ReactNode {
  return (
    <div className="[grid-area:banner] flex justify-between items-center gap-6 animate-pulse">
      <div className="w-1/3 p-4">
        <div className={clsx("w-60 h-8 mt-4 rounded-md bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
        <div className={clsx("w-48 h-6 my-2 rounded-md bg-gray-200", "dark:bg-dark-skeleton-content-background")} />
      </div>
      <BannerSkeleton />
    </div>
  );
}
