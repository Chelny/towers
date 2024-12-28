"use client"

import { ChangeEvent, ClipboardEvent, FocusEvent, ForwardedRef, forwardRef, ReactNode, useState } from "react"
import { Trans, useLingui } from "@lingui/react/macro"
import clsx from "clsx/lite"
import { FaEye, FaEyeSlash } from "react-icons/fa6"

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
  onInput?: (_: ChangeEvent<HTMLInputElement>) => void
  onPaste?: (_: ClipboardEvent<HTMLInputElement>) => void
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
    onPaste,
  }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
): ReactNode {
  const [value, setValue] = useState<string | null | undefined>(defaultValue)
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)
  const { t } = useLingui()

  const handleInput = (event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value)
    onInput?.(event)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    onPaste?.(event)
  }

  const handleTogglePasswordVisibility = (): void => {
    setIsPasswordVisible((isPasswordVisible: boolean) => !isPasswordVisible)
  }

  const inputType: string = type === "password" && isPasswordVisible ? "text" : type

  return (
    <div className="flex flex-col mb-4">
      <label id={`${id}Label`} htmlFor={id} className="mb-1 font-medium">
        {label}{" "}
        {!required && (
          <span className="text-neutral-500">
            (<Trans>optional</Trans>)
          </span>
        )}
      </label>
      <div className="relative">
        <input
          ref={ref}
          type={inputType}
          id={id}
          name={id}
          className={clsx(
            "overflow-hidden w-full p-1 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-sm bg-white text-black line-clamp-1",
            type === "password" && "pe-7",
            "read-only:bg-gray-200",
            "disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
            className,
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
          aria-invalid={errorMessage ? "true" : "false"}
          aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
          data-testid={dataTestId}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={(event: FocusEvent<HTMLInputElement>) => event.stopPropagation()}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute inset-y-0 end-2 flex items-center text-gray-800"
            aria-label={isPasswordVisible ? t({ message: "Hide password" }) : t({ message: "Show password" })}
            onClick={handleTogglePasswordVisibility}
          >
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
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
