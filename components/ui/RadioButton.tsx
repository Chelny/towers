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
  onChange?: (value: string) => void
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
    if (onChange) {
      onChange(event.target.value)
    }
  }

  return (
    <div className="w-full flex items-center gap-2">
      <input
        type="radio"
        id={id}
        className="peer opacity-0 absolute"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-disabled={disabled}
        onChange={handleChange}
      />
      <label
        htmlFor={id}
        className={clsx("flex items-center gap-2", "peer-enabled:cursor-pointer peer-disabled:cursor-not-allowed")}
        tabIndex={disabled ? -1 : 0}
      >
        <span
          className={clsx(
            "relative flex justify-center items-center w-5 h-5 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-full",
            disabled ? "bg-neutral-200 opacity-50 select-none" : "bg-white"
          )}
        >
          <span className={clsx("absolute block w-2 h-2 rounded-full", checked ? "bg-gray-600" : "hidden")}></span>
        </span>
        <span className="line-clamp-1">{label}</span>
      </label>
    </div>
  )
}
