"use client";

import { ChangeEvent, ReactNode } from "react";
import clsx from "clsx/lite";

type RadioButtonProps = {
  id: string
  name: string
  label: string
  value: string
  checked?: boolean
  disabled?: boolean
  dataTestId?: string
  onChange?: (_: ChangeEvent<HTMLInputElement>) => void
};

export default function RadioButton({
  id,
  name,
  label,
  value,
  checked = false,
  disabled = false,
  dataTestId = undefined,
  onChange,
}: RadioButtonProps): ReactNode {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange?.(event);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="grid place-items-center">
        <input
          type="radio"
          id={id}
          className={clsx(
            "peer appearance-none col-start-1 row-start-1 shrink-0 w-5 h-5 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-full bg-white",
            "hover:cursor-pointer",
            "disabled:bg-gray-200/50 disabled:cursor-not-allowed",
            "dark:border-t-dark-input-border-top dark:border-e-dark-input-border-end dark:border-b-dark-input-border-bottom dark:border-s-dark-input-border-start dark:bg-dark-input-background",
            "dark:disabled:bg-dark-input-disabled-background",
          )}
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          aria-labelledby={`${id}Label`}
          data-testid={dataTestId ? `${dataTestId}-${value}` : undefined}
          onChange={handleChange}
        />
        <div
          className={clsx(
            "col-start-1 row-start-1 w-2 h-2 rounded-full pointer-events-none",
            "peer-checked:bg-gray-600 peer-checked:cursor-pointer dark:peer-checked:bg-dark-input-text",
            "peer-disabled:bg-gray-400 peer-disabled:cursor-not-allowed",
          )}
        />
      </div>
      <label
        id={`${id}Label`}
        htmlFor={id}
        className={clsx(
          "line-clamp-1",
          disabled ? "text-black/50 cursor-not-allowed dark:text-white/50" : "cursor-pointer",
        )}
      >
        {label}
      </label>
    </div>
  );
}
