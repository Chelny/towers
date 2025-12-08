import { ReactNode } from "react";
import clsx from "clsx/lite";

export default function BannerSkeleton(): ReactNode {
  return (
    <div className={clsx("flex-1 flex justify-end py-2", "lg:justify-center")}>
      <div
        className={clsx(
          "flex items-center justify-center w-[728px] h-[90px] border-2 border-gray-200 bg-gray-200",
          "dark:dark:border-dark-skeleton-border dark:bg-dark-skeleton-content-background",
        )}
      />
    </div>
  );
}
