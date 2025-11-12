"use client";

import { MouseEvent, PropsWithChildren, ReactNode } from "react";
import clsx from "clsx/lite";

type ButtonProps = PropsWithChildren<{
  type?: "button" | "submit" | "reset" | undefined
  id?: string
  className?: string
  disabled?: boolean
  tabIndex?: number
  dataTestId?: string
  onClick?: (_: MouseEvent<HTMLButtonElement>) => void
}>

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
        "p-1 overflow-hidden border-2 border-t-gray-200 border-e-gray-400 border-b-gray-400 border-s-gray-200 rounded-xs ring-1 ring-black bg-gray-300 text-black line-clamp-1",
        "active:relative active:inset-[1px]",
        "disabled:inset-0 disabled:border-t-gray-200/50 disabled:border-e-gray-400/50 disabled:border-b-gray-400/50 disabled:border-s-gray-200/50 disabled:ring-black/50 disabled:bg-gray-300/50 disabled:text-gray-400 disabled:cursor-not-allowed",
        "dark:border-t-dark-button-border-top dark:border-e-dark-button-border-end dark:border-b-dark-button-border-bottom dark:border-s-dark-button-border-start dark:bg-dark-button-background dark:text-dark-button-text",
        "dark:disabled:border-t-dark-button-border-top/50 dark:disabled:border-e-dark-button-border-end/50 dark:disabled:border-b-dark-button-border-bottom/50 dark:disabled:border-s-dark-button-border-start/50 dark:disabled:bg-dark-button-background/50 dark:disabled:text-dark-button-text/50",
        className,
      )}
      disabled={disabled}
      tabIndex={tabIndex}
      data-testid={dataTestId}
      {...props}
      onClick={(event: MouseEvent<HTMLButtonElement>) => onClick?.(event)}
    >
      {children}
    </button>
  );
}
