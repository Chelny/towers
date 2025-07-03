"use client"

import {
  KeyboardEvent,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react"
import React from "react"
import { Trans } from "@lingui/react/macro"
import clsx from "clsx/lite"
import { PiCaretDownDuotone, PiCaretDownFill } from "react-icons/pi"

type SelectProps = PropsWithChildren<{
  id: string
  label?: string
  className?: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  dataTestId?: string
  description?: string
  errorMessage?: string
  onChange?: (value: string) => void
}>

export default function Select({
  children,
  id,
  label,
  className = "",
  placeholder = "",
  defaultValue = "",
  required = false,
  disabled = false,
  dataTestId = undefined,
  description = "",
  errorMessage = "",
  onChange,
}: SelectProps): ReactNode {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue)
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  const dropdownRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement | null>(null)
  const options = React.Children.toArray(children) as ReactElement<SelectOptionProps>[]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const selectBox: HTMLElement | null = document.getElementById(id)
      const dropdown: HTMLElement | null = document.getElementById(`${id}Dropdown`)

      if (
        selectBox &&
        dropdown &&
        !selectBox.contains(event.target as Node) &&
        !dropdown.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [id])

  useEffect(() => {
    if (isDropdownOpen && dropdownRef.current) {
      const selectedOption: Element | null = dropdownRef.current.querySelector(`[id="${id}-${selectedValue}"]`)
      selectedOption?.scrollIntoView({ behavior: "auto", block: "nearest" })
    }
  }, [isDropdownOpen, selectedValue])

  useEffect(() => {
    setSelectedValue(defaultValue)
  }, [defaultValue])

  const handleSelectChange = (value: string): void => {
    setSelectedValue(value)
    onChange?.(value)
    setIsDropdownOpen(false)
  }

  return (
    <div className="relative w-full mb-4">
      {label && (
        <label id={`${id}Label`} className="mb-1 font-medium">
          {label}{" "}
          {!required && (
            <span className={clsx("text-neutral-500", "dark:text-dark-text-muted")}>
              (<Trans>optional</Trans>)
            </span>
          )}
        </label>
      )}
      <div
        id={id}
        className={clsx(
          "flex justify-between items-center w-full h-8 px-1 py-4 overflow-hidden border-2 border-t-gray-200 border-e-gray-400 border-b-gray-400 border-s-gray-200 rounded-sm ring-1 ring-black bg-gray-300 text-black line-clamp-1 cursor-pointer",
          disabled && "bg-gray-200 opacity-50 cursor-not-allowed",
          "dark:border-t-dark-button-border-top dark:border-e-dark-button-border-end dark:border-b-dark-button-border-bottom dark:border-s-dark-button-border-start dark:bg-dark-button-background dark:text-dark-button-text",
          className,
        )}
        role="combobox"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-controls={`${id}Dropdown`}
        aria-expanded={isDropdownOpen}
        aria-labelledby={`${id}Label`}
        aria-describedby={description ? `${id}Description` : undefined}
        aria-required={required}
        aria-disabled={disabled}
        aria-invalid={errorMessage ? "true" : "false"}
        aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
        data-testid={dataTestId}
        onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            !disabled && setIsDropdownOpen(!isDropdownOpen)
          }
        }}
      >
        <span id={id} className="sr-only">
          {placeholder}
        </span>
        <span>{options.find((option) => option.props.value === selectedValue)?.props.children}</span>
        {disabled ? <PiCaretDownDuotone /> : <PiCaretDownFill className="ms-2" />}
      </div>
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          id={`${id}Dropdown`}
          className={clsx(
            "absolute z-20 mt-1 py-1 overflow-y-auto w-full max-h-60 border border-gray-300 shadow-lg rounded bg-white",
            "dark:border-dark-card-border dark:bg-dark-card-background",
          )}
          role="listbox"
          aria-activedescendant={selectedValue ? `${id}-${selectedValue}` : undefined}
        >
          {options.map((option: ReactElement<SelectOptionProps>) => (
            <div
              key={option.props.value}
              id={`${id}-${option.props.value}`}
              className={clsx(
                "block w-full px-2 py-2 text-start cursor-pointer",
                "hover:bg-gray-200 dark:hover:bg-slate-600",
                option.props.value === selectedValue && "bg-blue-100 dark:bg-slate-500",
              )}
              role="option"
              tabIndex={0}
              aria-selected={option.props.value === selectedValue}
              aria-disabled={disabled}
              onClick={() => !disabled && handleSelectChange(option.props.value)}
              onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
                if (event.code === "Enter" || event.code === "Space") {
                  event.preventDefault()
                  !disabled && handleSelectChange(option.props.value)
                }
              }}
            >
              {option.props.children}
            </div>
          ))}
        </div>
      )}
      {description && (
        <p id={`${id}Description`} className={clsx("text-neutral-500", "dark:text-dark-text-muted")}>
          {description}
        </p>
      )}
      {errorMessage && (
        <span id={`${id}ErrorMessage`} className={clsx("text-red-600", "dark:text-red-400")}>
          {errorMessage}
        </span>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" name={id} value={selectedValue} />
    </div>
  )
}

type SelectOptionProps = PropsWithChildren<{
  value: string
}>

const Option = ({}: SelectOptionProps): ReactNode => null

Select.Option = Option
