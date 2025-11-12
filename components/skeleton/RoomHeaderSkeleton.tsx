import { ReactNode } from "react";
import clsx from "clsx/lite";
import BannerSkeleton from "@/components/skeleton/BannerSkeleton";

export default function RoomHeaderSkeleton(): ReactNode {
  return (
    <div className="[grid-area:banner] animate-pulse">
      <div className="flex justify-between items-center gap-6">
        <h1 className={clsx("w-1/3 p-4 m-4 rounded-md bg-gray-200", "dark:bg-dark-skeleton-content-background")}></h1>
        <BannerSkeleton />
      </div>

      <div className={clsx("px-4 py-1 bg-gray-300", "dark:bg-dark-skeleton-content-background")}>&nbsp;</div>
    </div>
  );
}
