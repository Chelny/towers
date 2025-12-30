"use client"; // Error boundaries must be Client Components

import { ReactNode } from "react";
import { Inter } from "next/font/google";
import clsx from "clsx/lite";
import Button from "@/components/ui/Button";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
};

export default function GlobalError({ error, reset }: GlobalErrorProps): ReactNode {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <div className="relative overflow-hidden flex flex-col items-center justify-center w-full h-screen p-2 sm:p-0 bg-youpi-primary">
          <div
            className={clsx(
              "flex flex-col items-center justify-center gap-2 w-full sm:w-96 rounded shadow-xl bg-gray-200",
              "dark:bg-dark-card-background",
            )}
          >
            <div className={clsx("w-full h-8 rounded-t bg-gray-300 font-bold", "dark:bg-dark-background")} />
            <div className="flex flex-col gap-6 w-full px-4 pb-4">
              <div>
                <h1>Something went wrong</h1>
                <p>{error.message}</p>
              </div>
              <Button
                className="self-end"
                onClick={
                  // Attempt to recover by trying to re-render the segment
                  () => reset()
                }
              >
                Try again
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
