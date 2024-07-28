"use client"

import React, { ReactNode, useEffect, useRef, useState } from "react"
import clsx from "clsx/lite"
import {
  PiCaretDoubleLeftDuotone,
  PiCaretDoubleRightDuotone,
  PiCaretLeftDuotone,
  PiCaretRightDuotone
} from "react-icons/pi"
import Button from "@/components/ui/Button"

type CalendarProps = {
  id: string
  label: string
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  defaultValue?: string
  required?: boolean
  disabled?: boolean
  description?: string
  errorMessage?: string
  onChange?: (date: string) => void
}

export default function Calendar({
  id,
  label,
  placeholder = "Select a date",
  minDate = new Date(new Date().getFullYear() - 100, new Date().getMonth(), new Date().getDate()),
  maxDate = new Date(),
  defaultValue = undefined,
  required = false,
  disabled = false,
  description = "",
  errorMessage = "",
  onChange
}: CalendarProps): ReactNode {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(defaultValue ? new Date(defaultValue) : undefined)
  const [browsingDate, setBrowsingDate] = useState<Date>(
    maxDate ? new Date(Math.min(maxDate.getTime(), new Date().getTime())) : new Date()
  )
  const [daysInMonth, setDaysInMonth] = useState<number[]>([])
  const [isCalendarVisible, setCalendarVisible] = useState<boolean>(false)
  const [view, setView] = useState<"month" | "year">("month")
  const [currentDecade, setCurrentDecade] = useState<number>(Math.floor(browsingDate.getFullYear() / 10) * 10)
  const calendarRef = useRef<HTMLDivElement>(null)
  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
  const daysOfWeek: string[] = ["S", "M", "T", "W", "T", "F", "S"]

  useEffect(() => {
    const year: number = browsingDate.getFullYear()
    const month: number = browsingDate.getMonth()
    const daysInMonthCount: number = new Date(year, month + 1, 0).getDate()
    setDaysInMonth(Array.from({ length: daysInMonthCount }, (_, index: number) => index + 1))
  }, [browsingDate])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setCalendarVisible(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const openCalendar = (): void => {
    const initialBrowsingDate: Date = selectedDate || (maxDate && maxDate < new Date() ? maxDate : new Date())

    setBrowsingDate(initialBrowsingDate)
    setCalendarVisible(!isCalendarVisible)
  }

  const handleSelectDay = (day: number): void => {
    if (disabled) return

    const newDate: Date = new Date(browsingDate.getFullYear(), browsingDate.getMonth(), day)
    setSelectedDate(newDate)

    if (onChange) {
      onChange(newDate.toISOString().split("T")[0])
    }

    setCalendarVisible(false)
  }

  const handleYearChange = (direction: number): void => {
    const newYear: number = browsingDate.getFullYear() + direction
    const newBrowsingDate: Date = new Date(
      newYear,
      browsingDate.getMonth(),
      Math.min(
        selectedDate ? selectedDate.getDate() : new Date().getDate(),
        new Date(newYear, browsingDate.getMonth() + 1, 0).getDate()
      )
    )

    setBrowsingDate(newBrowsingDate)
  }

  const handleMonthChange = (direction: number): void => {
    const newMonth: number = browsingDate.getMonth() + direction
    const newYear: number = browsingDate.getFullYear() + Math.floor(newMonth / 12)
    const adjustedMonth: number = newMonth % 12
    const newBrowsingDate: Date = new Date(newYear, adjustedMonth)

    setBrowsingDate(newBrowsingDate)
  }

  const renderDayPicker = (): ReactNode => {
    const firstDayOfMonth: number = new Date(browsingDate.getFullYear(), browsingDate.getMonth(), 1).getDay()
    const daysArray: (number | null)[] = new Array(firstDayOfMonth).fill(null).concat(daysInMonth)
    const rows: (number | null)[][] = []
    const currentYear: number = browsingDate.getFullYear()
    const currentMonth: number = browsingDate.getMonth()
    const isCurrentMonthMinYear: boolean = currentYear === minDate.getFullYear() && currentMonth === minDate.getMonth()
    const isCurrentMonthMaxYear: boolean = currentYear === maxDate.getFullYear() && currentMonth === maxDate.getMonth()

    for (let i = 0; i < daysArray.length; i += 7) {
      rows.push(daysArray.slice(i, i + 7))
    }

    return (
      <div className="grid grid-rows-6 grid-cols-1 gap-1">
        <div className="grid grid-cols-7 text-center font-semibold" role="grid">
          {daysOfWeek.map((day: string, index: number) => (
            <div key={index} className="p-2" role="columnheader">
              {day}
            </div>
          ))}
        </div>
        {rows.map((week: (number | null)[], weekIndex: number) => (
          <div key={weekIndex} role="row">
            <div className="grid grid-cols-7 gap-1">
              {week.map((day: number | null, dayIndex: number) => {
                const displayDay: number | string = day !== null ? day : ""
                const isSelectedDay: boolean =
                  day === selectedDate?.getDate() &&
                  browsingDate.getMonth() === selectedDate?.getMonth() &&
                  browsingDate.getFullYear() === selectedDate?.getFullYear()
                const isDisabledDay: boolean =
                  (isCurrentMonthMinYear && day !== null && day <= maxDate.getDate()) ||
                  (isCurrentMonthMaxYear && day !== null && day > maxDate.getDate())

                return (
                  <button
                    key={dayIndex}
                    type="button"
                    className={clsx(
                      "flex-1 p-2 text-center border rounded-sm cursor-pointer",
                      !disabled && "hover:bg-gray-200",
                      day === null ? "text-gray-400" : "",
                      isSelectedDay ? "bg-blue-200" : "",
                      isDisabledDay ? "opacity-50 cursor-not-allowed" : ""
                    )}
                    disabled={isDisabledDay}
                    role="gridcell"
                    tabIndex={isDisabledDay ? -1 : 0}
                    aria-selected={isSelectedDay}
                    onClick={() => !isDisabledDay && day && handleSelectDay(day)}
                  >
                    {displayDay}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderYearPicker = (): ReactNode => {
    const yearsInDecade: number[] = Array.from({ length: 10 }, (_, index: number) => currentDecade + index)

    return (
      <div>
        <div className="flex justify-between mt-2">
          <button
            type="button"
            disabled={currentDecade <= minDate.getFullYear()}
            onClick={() => setCurrentDecade(currentDecade - 10)}
          >
            Previous Decade
          </button>
          <button
            type="button"
            disabled={currentDecade + 10 > maxDate.getFullYear()}
            onClick={() => setCurrentDecade(currentDecade + 10)}
          >
            Next Decade
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {yearsInDecade.map(
            (year: number) =>
              year <= maxDate.getFullYear() && (
                <button
                  key={year}
                  type="button"
                  className="p-2 text-center border rounded-sm hover:bg-gray-200"
                  disabled={year > maxDate.getFullYear() || year < minDate.getFullYear()}
                  onClick={() => {
                    setBrowsingDate(new Date(year, browsingDate.getMonth()))
                    setView("month")
                  }}
                >
                  {year}
                </button>
              )
          )}
        </div>
      </div>
    )
  }

  const isPreviousYearDisabled: boolean = browsingDate.getFullYear() <= minDate.getFullYear()
  const isNextYearDisabled: boolean = browsingDate.getFullYear() >= maxDate.getFullYear()
  const isPreviousMonthDisabled: boolean =
    browsingDate.getFullYear() === minDate.getFullYear() && browsingDate.getMonth() <= minDate.getMonth()
  const isNextMonthDisabled: boolean =
    browsingDate.getFullYear() === maxDate.getFullYear() && browsingDate.getMonth() >= maxDate.getMonth()

  return (
    <div className="relative mb-4">
      <label id={`${id}Label`} htmlFor={id} className="block mb-2 font-medium">
        {label} {!required && <span className="text-neutral-500">(optional)</span>}
      </label>
      <Button
        className="w-full"
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={isCalendarVisible}
        aria-label={label}
        aria-describedby={description ? `${id}Description` : undefined}
        aria-disabled={disabled}
        onClick={openCalendar}
      >
        {selectedDate ? selectedDate.toISOString().split("T")[0] : placeholder}
      </Button>
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

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={id}
        value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
        required={required}
      />

      {isCalendarVisible && (
        <div
          ref={calendarRef}
          className="absolute left-1/2 z-10 min-w-96 max-w-max p-4 border border-gray-300 rounded shadow-md bg-white -translate-x-1/2"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex justify-center items-center gap-2 mb-2">
            <button
              type="button"
              disabled={isPreviousYearDisabled}
              aria-label="Previous Year"
              onClick={() => handleYearChange(-1)}
            >
              <PiCaretDoubleLeftDuotone className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={isPreviousMonthDisabled}
              aria-label="Previous Month"
              onClick={() => handleMonthChange(-1)}
            >
              <PiCaretLeftDuotone className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="flex-1 text-lg"
              aria-live="polite"
              onClick={() => setView(view === "month" ? "year" : "month")}
            >
              {view === "month"
                ? `${monthNames[browsingDate.getMonth()]} ${browsingDate.getFullYear()}`
                : "Select Year"}
            </button>
            <button
              type="button"
              disabled={isNextMonthDisabled}
              aria-label="Next Month"
              onClick={() => handleMonthChange(1)}
            >
              <PiCaretRightDuotone className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={isNextYearDisabled}
              aria-label="Next Year"
              onClick={() => handleYearChange(1)}
            >
              <PiCaretDoubleRightDuotone className="w-5 h-5" />
            </button>
          </div>

          {view === "month" ? renderDayPicker() : renderYearPicker()}
        </div>
      )}
    </div>
  )
}
