"use client"; // Error components must be Client Components

import { ReactNode, useEffect } from "react";
import { Trans } from "@lingui/react/macro";
import { clsx } from "clsx/lite";
import Button from "@/components/ui/Button";
import { logger } from "@/lib/logger";

type RootErrorProps = PageProps<"/[locale]/error"> & {
  error: Error & { digest?: string }
  reset: () => void
};

export default function Error({ error, reset }: RootErrorProps): ReactNode {
  useEffect(() => {
    // Log the error to an error reporting service
    logger.error(error);
  }, [error]);

  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center w-full h-screen p-2 sm:p-0 bg-towers-primary">
      <div
        className={clsx(
          "flex flex-col items-center justify-center gap-2 w-full sm:w-96 rounded shadow-xl bg-gray-200",
          "dark:bg-dark-card-background",
        )}
      >
        <div className={clsx("w-full h-8 rounded-t bg-gray-300 font-bold", "dark:bg-dark-background")} />
        <div className="flex flex-col gap-6 w-full px-4 pb-4">
          <h2 className="text-lg">
            <Trans>Something went wrong</Trans>
          </h2>
          <Button
            className="self-end"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            <Trans>Try again</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
}
