"use client";

import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";

export default function Banner(): ReactNode {
  return (
    <div className={clsx("flex-1 flex justify-end py-2", "lg:justify-center")}>
      <div
        className={clsx(
          "flex items-center justify-center w-[728px] h-[90px] border-2 border-gray-300 bg-slate-50 text-gray-500",
          "dark:border-slate-600 dark:bg-slate-700 dark:text-gray-400",
        )}
      >
        <span className="text-lg">
          <Trans>advertisement</Trans>
        </span>
      </div>
    </div>
  );
}
