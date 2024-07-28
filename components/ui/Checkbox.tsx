"use client"

import { ChangeEvent, ReactNode } from "react"
import { useState } from "react"
import clsx from "clsx/lite"
import { TiTick } from "react-icons/ti"

type CheckboxProps = {
  id: string
  label: string
  isTableCheckbox?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}

export default function Checkbox({
  id,
  label,
  isTableCheckbox = false,
  defaultChecked = false,
  disabled = false,
  onChange
}: CheckboxProps): ReactNode {
  const [checked, setChecked] = useState<boolean>(defaultChecked)

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setChecked(event.target.checked)

    if (onChange) {
      onChange(event.target.checked)
    }
  }

  return (
    <div className="w-full flex jusitfy-center items-center gap-2">
      <input
        type="checkbox"
        id={id}
        className={clsx(
          "peer relative shrink-0 appearance-none w-5 h-5 rounded-sm mt-1 cursor-pointer",
          isTableCheckbox
            ? "border border-custom-neutral-400 bg-custom-blue-200 ring-2 ring-custom-blue-200"
            : "border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 bg-white"
        )}
        name={id}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-disabled={disabled}
        onChange={handleChange}
      />
      <TiTick className="absolute w-5 h-5 pointer-events-none hidden peer-checked:block stroke-custom-neutral-400 mt-1 outline-none" />
      <label htmlFor={id} className={clsx("mt-1", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        {label}
      </label>
    </div>
  )
}
