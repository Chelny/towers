"use client";

import { ChangeEvent, PropsWithChildren, ReactElement, ReactNode, useState } from "react";
import React from "react";
import { Trans } from "@lingui/react/macro";
import clsx from "clsx/lite";
import RadioButton from "./RadioButton";

type RadioButtonGroupProps = PropsWithChildren<{
  id: string
  label: string
  inline?: boolean
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  dataTestId?: string
  description?: string
  errorMessage?: string
  onChange?: (_: ChangeEvent<HTMLInputElement>) => void
}>

export default function RadioButtonGroup({
  children,
  id,
  label,
  inline = false,
  defaultValue = "",
  required = false,
  disabled = false,
  dataTestId = undefined,
  description = "",
  errorMessage = "",
  onChange,
}: RadioButtonGroupProps): ReactNode {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const options = React.Children.toArray(children) as ReactElement<RadioButtonOptionProps>[];

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(event.target.value);
    onChange?.(event);
  };

  return (
    <fieldset
      className="mb-4"
      disabled={disabled}
      role="radiogroup"
      aria-labelledby={`${id}Label`}
      aria-describedby={description ? `${id}Description` : undefined}
      aria-required={required}
      aria-invalid={errorMessage ? "true" : "false"}
      aria-errormessage={errorMessage ? `${id}ErrorMessage` : undefined}
      data-testid={dataTestId}
    >
      <legend id={`${id}Label`} className="mb-1 font-medium">
        {label}{" "}
        {!required && (
          <span className={clsx("text-neutral-500", "dark:text-dark-text-muted")}>
            (<Trans>optional</Trans>)
          </span>
        )}
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
            dataTestId={dataTestId}
            onChange={handleChange}
          />
        ))}
      </div>
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
    </fieldset>
  );
}

type RadioButtonOptionProps = {
  id: string
  label: string
  value: string
  disabled?: boolean
}

const Option = ({}: RadioButtonOptionProps): ReactNode => null;

RadioButtonGroup.Option = Option;
