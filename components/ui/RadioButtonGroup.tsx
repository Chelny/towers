"use client"

import { ReactElement, ReactNode, useState } from "react"
import React from "react"
import clsx from "clsx/lite"
import RadioButton from "./RadioButton"

type RadioButtonGroupProps = {
  children: ReactNode
  id: string
  label: string
  inline?: boolean
  required?: boolean
  disabled?: boolean
  description?: string
  errorMessage?: string
  onChange?: (value: string) => void
}

export default function RadioButtonGroup({
  children,
  id,
  label,
  inline = false,
  required = false,
  disabled = false,
  description = "",
  errorMessage = "",
  onChange
}: RadioButtonGroupProps): ReactNode {
  const [selectedValue, setSelectedValue] = useState<string>("")
  const options = React.Children.toArray(children) as ReactElement<RadioButtonOptionProps>[]

  const handleChange = (value: string): void => {
    setSelectedValue(value)

    if (onChange) {
      onChange(value)
    }
  }

  return (
    <fieldset
      className="mb-4"
      disabled={disabled}
      role="radiogroup"
      aria-labelledby={`${id}Label`}
      aria-describedby={description ? `${id}Description` : undefined}
      aria-required={required}
      aria-invalid={errorMessage ? "true" : "false"}
      aria-disabled={disabled}
      aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
    >
      <legend id={`${id}Label`} className="mb-1 font-medium">
        {label} {!required && <span className="text-neutral-500">(optional)</span>}
      </legend>
      <div className={clsx("flex justify-evenly mb-1", inline ? "flex-row" : "flex-col gap-2")}>
        {options.map((option: ReactElement<RadioButtonOptionProps>) => (
          <RadioButton
            key={option.props.id}
            id={option.props.id}
            name={id}
            label={option.props.label}
            value={option.props.value}
            checked={selectedValue === option.props.value}
            onChange={handleChange}
          />
        ))}
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
    </fieldset>
  )
}

type RadioButtonOptionProps = {
  id: string
  value: string
  label: string
}

const Option = ({ id, value, label }: RadioButtonOptionProps): ReactNode => null

RadioButtonGroup.Option = Option
