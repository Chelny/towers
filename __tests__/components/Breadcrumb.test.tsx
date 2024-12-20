import { usePathname } from "next/navigation"
import { render, screen } from "@testing-library/react"
import Breadcrumb from "@/components/ui/Breadcrumb"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}))

describe("Breadcrumb Component", () => {
  it("should render Home link correctly", () => {
    vi.mocked(usePathname).mockReturnValue("/")

    render(<Breadcrumb />)

    const homeLink: HTMLAnchorElement = screen.getByText("Home")
    expect(homeLink).toHaveAttribute("href", "/")
  })

  it("should render breadcrumb links correctly based on the path", () => {
    vi.mocked(usePathname).mockReturnValue("/account/profile")

    render(<Breadcrumb />)

    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Account")).toHaveAttribute("href", "/account")
    expect(screen.getByText("Profile")).toBeInTheDocument()
    expect(screen.getByText("Profile")).not.toHaveAttribute("href")
  })

  it("should format breadcrumb links correctly with hyphenated names", () => {
    vi.mocked(usePathname).mockReturnValue("/account/change-password")

    render(<Breadcrumb />)

    expect(screen.getByText("Change Password")).toBeInTheDocument()
  })
})
