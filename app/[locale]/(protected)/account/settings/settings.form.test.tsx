import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"
import { SettingsForm } from "@/app/[locale]/(protected)/account/settings/settings.form"
import { APP_COOKIES } from "@/constants/app"
import { mockSession } from "@/test/data/session"
import { mockFetch, mockFetchResponse, mockUseRouter } from "@/vitest.setup"

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/en/account/settings"),
  useRouter: vi.fn(() => mockUseRouter),
}))

describe("Settings Form", () => {
  beforeAll(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    mockFetch.mockReset()
  })

  it("should render the language select box and button", () => {
    render(<SettingsForm session={mockSession.data} />)

    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Update Settings/i })).toBeInTheDocument()
  })

  it("should submit the form with the selected language", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    }

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse))

    render(<SettingsForm session={mockSession.data} />)

    fireEvent.click(screen.getByTestId("settings-language-select"))
    fireEvent.click(screen.getByRole("option", { name: /French/i }))
    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    expect(mockFetch).toHaveBeenCalledWith("/api/account/settings", {
      method: "POST",
      body: JSON.stringify({ language: "fr" }),
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

  it("should load and set form state from localStorage", () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    }

    global.localStorage.setItem(APP_COOKIES.SETTINGS_FORM_STATE, JSON.stringify(mockResponse))

    render(<SettingsForm session={mockSession.data} />)

    expect(screen.getByText("The settings have been updated!")).toBeInTheDocument()
  })

  it("should update the language cookie and redirects", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    }

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse))

    render(<SettingsForm session={mockSession.data} />)

    fireEvent.click(screen.getByTestId("settings-language-select"))
    fireEvent.click(screen.getByRole("option", { name: /French/i }))
    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }))

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    expect(mockFetch).toHaveBeenCalledWith("/api/account/settings", {
      method: "POST",
      body: JSON.stringify({ language: "fr" }),
    })

    await waitFor(() => {
      expect(mockUseRouter.push).toHaveBeenCalledWith("/fr/account/settings")
    })
  })
})
