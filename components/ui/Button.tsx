"use client"

import { MouseEvent, ReactNode } from "react"
import clsx from "clsx/lite"

type ButtonProps = {
  children: ReactNode
  type?: "button" | "submit" | "reset" | undefined
  id?: string
  className?: string
  disabled?: boolean
  tabIndex?: number
  dataTestId?: string
  onClick?: (_: MouseEvent<HTMLButtonElement>) => void
}

export default function Button({
  children,
  id = undefined,
  type = "button",
  className = "",
  disabled = false,
  tabIndex = 0,
  dataTestId = undefined,
  onClick,
  ...props
}: ButtonProps): ReactNode {
  return (
    <button
      type={type}
      id={id}
      className={clsx(
        "p-1 overflow-hidden border-2 border-t-gray-200 border-e-gray-400 border-b-gray-400 border-s-gray-200 rounded-sm ring-1 ring-black bg-gray-300 text-black line-clamp-1",
        "active:relative active:inset-[1px] disabled:inset-0",
        "disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled}
      tabIndex={tabIndex}
      aria-disabled={disabled}
      data-testid={dataTestId}
      {...props}
      onClick={(event: MouseEvent<HTMLButtonElement>) => onClick?.(event)}
    >
      {children}
    </button>
  )
}
