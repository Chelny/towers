import { WebsiteTheme } from "@prisma/client"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { SettingsForm } from "@/app/[locale]/(protected)/account/settings/settings.form"
import { mockSession } from "@/test/data/session"
import { mockFetch, mockFetchResponse, mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/en/account/settings"),
  useRouter: vi.fn(() => mockUseRouter),
}))

describe("Settings Form", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  it("should render the form with all elements", () => {
    render(<SettingsForm session={mockSession.data} />)

    expect(screen.getByTestId("settings_select_language")).toBeInTheDocument()
    expect(screen.getByTestId("settings_select_theme")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Update Settings/i })).toBeInTheDocument()
  })

  it("should submit the form successfully", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    }

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse))

    render(<SettingsForm session={mockSession.data} />)

    fireEvent.click(screen.getByTestId("settings_select_language"))
    fireEvent.click(screen.getByRole("option", { name: /French/i }))
    fireEvent.click(screen.getByTestId("settings_select_theme"))
    fireEvent.click(screen.getByRole("option", { name: /Dark/i }))
    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    expect(mockFetch).toHaveBeenCalledWith("/api/account/settings", {
      method: "POST",
      body: JSON.stringify({ language: "fr", theme: WebsiteTheme.DARK }),
    })

    expect(screen.getByText("The settings have been updated!")).toBeInTheDocument()
  })

  it("should display an error message when the API call fails", async () => {
    const mockResponse: ApiResponse = {
      success: false,
      message: "Failed to update settings",
    }

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse))

    render(<SettingsForm session={mockSession.data} />)

    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }))

    await waitFor(() => expect(screen.getByText("Failed to update settings")).toBeInTheDocument())
  })

  it("should update the language cookie and redirects", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    }

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse))

    render(<SettingsForm session={mockSession.data} />)

    fireEvent.click(screen.getByTestId("settings_select_language"))
    fireEvent.click(screen.getByRole("option", { name: /French/i }))
    fireEvent.click(screen.getByTestId("settings_select_theme"))
    fireEvent.click(screen.getByRole("option", { name: /Dark/i }))
    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    expect(mockFetch).toHaveBeenCalledWith("/api/account/settings", {
      method: "POST",
      body: JSON.stringify({ language: "fr", theme: WebsiteTheme.DARK }),
    })

    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 2000))

    await waitFor(() => {
      expect(mockUseRouter.push).toHaveBeenCalledWith("/fr/account/settings")
    })
  })
})
