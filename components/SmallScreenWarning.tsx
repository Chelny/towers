"use client"

import { ReactNode } from "react"
import clsx from "clsx/lite"

export default function SmallScreenWarning(): ReactNode {
  return (
    <div
      className={clsx(
        "small-screen-warning",
        "fixed z-50 flex flex-col justify-center w-[calc(100%-96px)] h-full -m-4 -mb-8 bg-white text-center",
      )}
    >
      <h2 className="text-2xl font-bold mb-2">Screen Too Small</h2>
      <p className="text-lg">
        Resize the window (recommended size: 1275px by 768px)
        <br />
        or use a computer for a better experience.
      </p>
    </div>
  )
}
