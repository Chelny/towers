"use client"

import { ReactNode } from "react"
import { Trans } from "@lingui/react/macro"
import clsx from "clsx/lite"

export default function SmallScreenWarning(): ReactNode {
  const width: string = "1275px"
  const height: string = "768px"

  return (
    <div
      className={clsx(
        "small-screen-warning",
        "fixed z-50 flex flex-col justify-center w-[calc(100%-96px)] h-full -m-4 -mb-8 bg-white text-center",
      )}
    >
      <h2 className="text-2xl font-bold mb-2">
        <Trans>Screen Too Small</Trans>
      </h2>
      <p className="text-lg">
        <Trans>
          Resize the window (recommended size: {width} by {height})
          <br />
          or use a computer for a better experience.
        </Trans>
      </p>
    </div>
  )
}
