"use client"

import { ChangeEvent, ReactNode } from "react"
import clsx from "clsx/lite"

type RadioButtonProps = {
  id: string
  name: string
  label: string
  value: string
  checked?: boolean
  disabled?: boolean
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function RadioButton({
  id,
  name,
  label,
  value,
  checked = false,
  disabled = false,
  onChange
}: RadioButtonProps): ReactNode {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange?.(event)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="grid place-items-center">
        <input
          type="radio"
          id={id}
          className={clsx(
            "peer appearance-none col-start-1 row-start-1 shrink-0 w-5 h-5 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-full bg-white",
            "disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          aria-checked={checked}
          aria-disabled={disabled}
          onChange={handleChange}
        />
        <div
          className={clsx(
            "col-start-1 row-start-1 w-2 h-2 rounded-full pointer-events-none",
            "peer-checked:bg-gray-600",
            "peer-checked:peer-disabled:bg-gray-200 peer-checked:peer-disabled:cursor-not-allowed"
          )}
        />
      </div>
      <label htmlFor={id} className={clsx("line-clamp-1", disabled && "opacity-50 cursor-not-allowed")}>
        {label}
      </label>
    </div>
  )
}
