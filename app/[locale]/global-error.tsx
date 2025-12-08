"use client";

import { ReactNode } from "react";
import { Trans } from "@lingui/react/macro";

type GlobalErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
};

export default function GlobalError({ error, reset }: GlobalErrorProps): ReactNode {
  return (
    <html>
      <body>
        <h1>
          <Trans>Something went wrong</Trans>
        </h1>
        <p>{error.message}</p>
        <button onClick={() => reset()}>
          <Trans>Try again</Trans>
        </button>
      </body>
    </html>
  );
}
