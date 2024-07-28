"use client"

import { ChangeEvent, ReactNode } from "react"
import { IoRadioButtonOffOutline } from "react-icons/io5"
import { PiRadioButtonFill } from "react-icons/pi"

type RadioButtonProps = {
  id: string
  name: string
  label: string
  value: string
  checked?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}

export default function RadioButton({
  id,
  name,
  label,
  value,
  checked = false,
  disabled = false,
  onChange
}: RadioButtonProps): ReactNode {
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (onChange) {
      onChange(event.target.value)
    }
  }

  return (
    <div className="w-full flex items-center gap-2">
      <input
        type="radio"
        id={id}
        className="peer absolute opacity-0"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-checked={checked}
        aria-disabled={disabled}
        onChange={handleChange}
      />
      <label htmlFor={id} className="flex items-center gap-1 cursor-pointer">
        {checked ? (
          <PiRadioButtonFill className="w-6 h-6 text-gray-600" />
        ) : (
          <IoRadioButtonOffOutline className="w-6 h-6 text-gray-600" />
        )}
        <span className="line-clamp-1">{label}</span>
      </label>
    </div>
  )
}
