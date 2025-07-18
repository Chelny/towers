import { fireEvent, render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Calendar from "@/components/ui/Calendar"

describe("Calendar", () => {
  it("should render Calendar component with placeholder", () => {
    render(<Calendar id="test-calendar" label="Select Date" placeholder="Select a date" />)
    expect(screen.getByText("Select a date")).toBeInTheDocument()
  })

  it("should open calendar when button is clicked", () => {
    render(<Calendar id="test-calendar" label="Select Date" />)

    fireEvent.click(screen.getByText("Select a date"))
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("should close calendar when close button is clicked", () => {
    render(<Calendar id="test-calendar" label="Select Date" />)

    fireEvent.click(screen.getByText("Select a date"))
    expect(screen.queryByRole("dialog")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Close"))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("should select a date when a day is clicked", () => {
    const handleChange: Mock = vi.fn()

    render(<Calendar id="test-calendar" label="Select Date" onChange={handleChange} />)
    fireEvent.click(screen.getByText("Select a date"))

    const days: HTMLElement[] = screen.getAllByRole("gridcell").filter((day: HTMLElement) => day.textContent !== "")
    fireEvent.click(days[0])
    expect(handleChange).toHaveBeenCalled()
    expect(screen.getByText(days[0].textContent as string, { exact: false })).toBeInTheDocument()
  })

  it("should navigate between months", () => {
    render(<Calendar id="test-calendar" label="Select Date" />)

    fireEvent.click(screen.getByText("Select a date"))

    const prevMonthButton: HTMLElement = screen.getByRole("button", { name: /Previous Month/i })
    const nextMonthButton: HTMLElement = screen.getByRole("button", { name: /Next Month/i })

    const currentDate: Date = new Date()
    const currentMonth: number = currentDate.getUTCMonth()
    const currentYear: number = currentDate.getUTCFullYear()

    const prevMonth: Date = new Date(currentYear, currentMonth - 1)
    const nextMonth: Date = new Date(prevMonth.getFullYear(), prevMonth.getUTCMonth() + 1)

    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })

    const prevMonthName: string = formatter.format(prevMonth)
    const nextMonthName: string = formatter.format(nextMonth)

    fireEvent.click(prevMonthButton)
    expect(screen.getByText(prevMonthName)).toBeInTheDocument()

    fireEvent.click(nextMonthButton)
    expect(screen.getByText(nextMonthName)).toBeInTheDocument()
  })

  it("should render year picker when month-year button is clicked", () => {
    render(<Calendar id="test-calendar" label="Select Date" />)

    fireEvent.click(screen.getByText("Select a date"))
    const currentYear: number = new Date().getFullYear()
    fireEvent.click(screen.getByText(new RegExp(currentYear.toString())))

    expect(screen.getByText("Previous Decade")).toBeInTheDocument()
    expect(screen.getByText("Next Decade")).toBeInTheDocument()
  })
})
