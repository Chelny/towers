"use client"

import { ChangeEvent, ClipboardEvent, FocusEvent, ForwardedRef, forwardRef, ReactNode, useState } from "react"
import clsx from "clsx/lite"

type InputProps = {
  id: string
  label: string
  type?: string
  className?: string
  placeholder?: string
  autoComplete?: string
  defaultValue?: string | null | undefined
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
  dataTestId?: string
  description?: string
  errorMessage?: string
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void
  onPaste?: (event: ClipboardEvent<HTMLInputElement>) => void
}

export default forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    type = "text",
    className = "",
    placeholder = "",
    autoComplete = undefined,
    defaultValue = "",
    required = false,
    readOnly = false,
    disabled = false,
    dataTestId = undefined,
    description = "",
    errorMessage = "",
    onInput,
    onPaste
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
): ReactNode {
  const [value, setValue] = useState<string | null | undefined>(defaultValue)

  const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value)
    onInput?.(event)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    onPaste?.(event)
  }

  return (
    <div className="flex flex-col mb-4">
      <label id={`${id}Label`} htmlFor={id} className="mb-1 font-medium">
        {label} {!required && <span className="text-neutral-500">(optional)</span>}
      </label>
      <input
        ref={ref}
        type={type}
        id={id}
        name={id}
        className={clsx(
          "overflow-hidden w-full p-1 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-sm bg-white text-black line-clamp-1",
          "read-only:bg-gray-200",
          "disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={String(value)}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        aria-labelledby={`${id}Label`}
        aria-describedby={description ? `${id}Description` : undefined}
        aria-placeholder={placeholder}
        aria-required={required}
        aria-invalid={errorMessage ? "true" : "false"}
        aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
        aria-disabled={disabled}
        data-testid={dataTestId}
        onInput={handleInput}
        onPaste={handlePaste}
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
})
