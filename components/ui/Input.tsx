"use client"

import { ChangeEvent, FocusEvent, ReactNode, useState } from "react"
import clsx from "clsx/lite"

type InputProps = {
  id: string
  label: string
  type?: string
  className?: string
  placeholder?: string
  autoComplete?: string
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  description?: string
  errorMessage?: string
  onInput?: (value: string) => void
}

export default function Input({
  id,
  label,
  type = "text",
  className = "",
  placeholder = "",
  autoComplete = undefined,
  defaultValue = "",
  required = false,
  disabled = false,
  description = "",
  errorMessage = "",
  onInput
}: InputProps): ReactNode {
  const [value, setValue] = useState<string>(defaultValue)

  const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value)

    if (onInput) {
      onInput(event.target.value)
    }
  }

  return (
    <div className="flex flex-col mb-4">
      <label id={`${id}Label`} htmlFor={id} className="mb-1 font-medium">
        {label} {!required && <span className="text-neutral-500">(optional)</span>}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        className={clsx(
          "overflow-hidden w-full p-1 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-sm text-black line-clamp-1",
          className
        )}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        required={required}
        disabled={disabled}
        aria-labelledby={`${id}Label`}
        aria-describedby={description ? `${id}Description` : undefined}
        aria-placeholder={placeholder}
        aria-required={required}
        aria-invalid={errorMessage ? "true" : "false"}
        aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
        aria-disabled={disabled}
        onInput={handleInput}
        onFocus={(event: FocusEvent<HTMLInputElement>) => event.stopPropagation()}
      />
      {description && (
        <p id={`${id}Description`} className="text-neutral-500">
          {description}
        </p>
      )}
      {errorMessage && (
        <span id={`${id}ErrorMessage`} className="text-red-600">
          {errorMessage}
        </span>
      )}
    </div>
  )
}
