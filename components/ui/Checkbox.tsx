"use client"

import { ChangeEvent, ReactNode, useEffect } from "react"
import { useState } from "react"
import clsx from "clsx/lite"
import { TiTick } from "react-icons/ti"

type CheckboxProps = {
  id: string
  label: string
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (value: boolean) => void
}

export default function Checkbox({
  id,
  label,
  defaultChecked = false,
  disabled = false,
  onChange
}: CheckboxProps): ReactNode {
  const [checked, setChecked] = useState<boolean>(defaultChecked)

  useEffect(() => {
    setChecked(defaultChecked)
  }, [defaultChecked])

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
          "peer relative shrink-0 appearance-none w-5 h-5 border-2 border-t-gray-600 border-e-gray-400 border-b-gray-400 border-s-gray-600 rounded-sm mt-1 bg-white cursor-pointer",
          "disabled:bg-neutral-200 disabled:cursor-not-allowed"
        )}
        name={id}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-disabled={disabled}
        onChange={handleChange}
      />
      <TiTick className={clsx("absolute hidden w-5 h-5 mt-1 text-gray-600", "peer-checked:block")} />
      <label
        htmlFor={id}
        className={clsx(
          "mt-1",
          "peer-enabled:cursor-pointer peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"
        )}
      >
        {label}
      </label>
    </div>
  )
}
