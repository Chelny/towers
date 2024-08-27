"use client"

import { ChangeEvent, ReactElement, ReactNode, useState } from "react"
import React from "react"
import clsx from "clsx/lite"
import RadioButton from "./RadioButton"

type RadioButtonGroupProps = {
  children: ReactNode
  id: string
  label: string
  inline?: boolean
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  description?: string
  errorMessage?: string
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function RadioButtonGroup({
  children,
  id,
  label,
  inline = false,
  defaultValue = "",
  required = false,
  disabled = false,
  description = "",
  errorMessage = "",
  onChange
}: RadioButtonGroupProps): ReactNode {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue)
  const options = React.Children.toArray(children) as ReactElement<RadioButtonOptionProps>[]

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(event.target.value)
    onChange?.(event)
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
      <div className={clsx("flex justify-evenly gap-2 mb-1", inline ? "flex-col md:flex-row" : "flex-col")}>
        {options.map((option: ReactElement<RadioButtonOptionProps>) => (
          <RadioButton
            key={option.props.id}
            id={option.props.id}
            name={id}
            label={option.props.label}
            value={option.props.value}
            checked={selectedValue === option.props.value}
            disabled={option.props.disabled || disabled}
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
  label: string
  value: string
  disabled?: boolean
}

const Option = ({ id, label, value, disabled = false }: RadioButtonOptionProps): ReactNode => null

RadioButtonGroup.Option = Option
