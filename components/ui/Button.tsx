"use client"

import { MouseEvent, ReactNode } from "react"
import clsx from "clsx/lite"

type ButtonProps = {
  children: ReactNode
  type?: "button" | "submit" | "reset" | undefined
  className?: string
  isTableButton?: boolean
  disabled?: boolean
  tabIndex?: number
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

export default function Button({
  children,
  type = "button",
  className = "",
  isTableButton = false,
  disabled = false,
  tabIndex = 0,
  onClick
}: ButtonProps): ReactNode {
  return (
    <button
      type={type}
      className={clsx(
        "p-1 overflow-hidden border-2 rounded-sm ring-1 ring-custom-neutral-400 text-black line-clamp-1",
        "active:relative active:inset-[1px] disabled:inset-0",
        isTableButton
          ? "border-t-custom-neutral-100 border-e-custom-blue-400 border-b-custom-blue-400 border-s-custom-neutral-100 bg-custom-blue-200 text-custom-blue-1000"
          : "border-t-gray-200 border-e-gray-400 border-b-gray-400 border-s-gray-200 bg-gray-300",
        className
      )}
      disabled={disabled}
      tabIndex={tabIndex}
      aria-disabled={disabled}
      onClick={(event: MouseEvent<HTMLButtonElement>) => onClick?.(event)}
    >
      {children}
    </button>
  )
}
