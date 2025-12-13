"use client";

import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";
import GoToHomepageLink from "@/components/GoToHomepageLink";

export default function NotFound(): ReactNode {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center w-full h-screen p-2 sm:p-0 bg-towers-primary">
      <div
        className={clsx(
          "flex flex-col items-center justify-center gap-2 w-full sm:w-96 rounded shadow-xl bg-gray-200",
          "dark:bg-dark-card-background",
        )}
      >
        <div className={clsx("w-full h-8 rounded-t bg-gray-300", "dark:bg-dark-background")} />
        <div className="flex flex-col gap-6 w-full px-4 pb-4">
          <div>
            <h2 className="text-lg">
              <Trans>Page Not Found</Trans>
            </h2>
            <p>
              <Trans>It looks like the page you’re looking for doesn’t exist or has been moved.</Trans>
            </p>
          </div>
          <div className="self-end">
            <GoToHomepageLink />
          </div>
        </div>
      </div>
    </div>
  );
}
