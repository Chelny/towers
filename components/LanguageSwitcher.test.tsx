import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Mock, vi } from "vitest"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import { mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/en/sign-in"),
  useRouter: vi.fn(() => mockUseRouter),
}))

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  it("should render the language switcher correctly", () => {
    render(<LanguageSwitcher />)

    waitFor(() => {
      expect(screen.getByTestId("language-switcher_select_locale")).toBeInTheDocument()
      expect(screen.getByText(/English/i)).toBeInTheDocument()
    })
  })

  it("should set the initial language based on the pathname", () => {
    const mockPush: Mock = vi.fn().mockReturnValue("/en/account/settings")
    mockUseRouter.push = mockPush

    render(<LanguageSwitcher />)

    waitFor(() => {
      const selectElement: HTMLInputElement | null = screen
        .getByTestId("language-switcher_select_locale")
        .querySelector("input")
      expect(selectElement).toBe("en")
    })
  })

  it("should change the language and redirects correctly", async () => {
    const mockPush: Mock = vi.fn()
    mockUseRouter.push = mockPush

    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByTestId("language-switcher_select_locale"))
    fireEvent.click(screen.getByRole("option", { name: /French/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/fr/sign-in")
    })
  })

  it("should update the language state when the selection changes", async () => {
    const mockPush: Mock = vi.fn()
    mockUseRouter.push = mockPush

    render(<LanguageSwitcher />)

    fireEvent.click(screen.getByTestId("language-switcher_select_locale"))
    fireEvent.click(screen.getByRole("option", { name: /French/i }))

    await waitFor(() => {
      expect(screen.getByTestId("language-switcher_select_locale")).toHaveTextContent("French")
    })
  })
})
