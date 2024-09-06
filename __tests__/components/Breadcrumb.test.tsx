import { usePathname } from "next/navigation"
import { render, screen } from "@testing-library/react"
import { Mock } from "vitest"
import Breadcrumb from "@/components/ui/Breadcrumb"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn()
}))

describe("Breadcrumb Component", () => {
  it("should render Home link correctly", () => {
    ;(usePathname as Mock).mockReturnValue("/")

    render(<Breadcrumb />)

    const homeLink: HTMLAnchorElement = screen.getByText("Home")
    expect(homeLink).toHaveAttribute("href", "/")
  })

  it("should render breadcrumb links correctly based on the path", () => {
    ;(usePathname as Mock).mockReturnValue("/account/profile")

    render(<Breadcrumb />)

    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Account")).toHaveAttribute("href", "/account")
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Profile")).not.toHaveAttribute("href")
  })

  it("should format breadcrumb links correctly with hyphenated names", () => {
    ;(usePathname as Mock).mockReturnValue("/account/update-password")

    render(<Breadcrumb />)

    expect(screen.getByText("Update Password")).toBeInTheDocument()
  })
})
