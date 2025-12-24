import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { SettingsForm } from "@/app/[locale]/(protected)/account/settings/settings.form";
import { mockFetch, mockFetchResponse } from "@/test/mocks/fetch";
import { mockUseRouter } from "@/test/mocks/router";
import { mockSession } from "@/test/mocks/session";
import { mockUser1 } from "@/test/mocks/user";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/en/account/settings"),
  useRouter: vi.fn(() => mockUseRouter),
}));

describe("Settings Form", () => {
  beforeEach(() => {
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("should render the form with all elements", () => {
    render(<SettingsForm session={mockSession} />);

    expect(screen.getByTestId("settings_select_language")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update Settings/i })).toBeInTheDocument();
  });

  it("should submit the form successfully", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    };

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse));

    render(<SettingsForm session={mockSession} />);

    fireEvent.click(screen.getByTestId("settings_select_language"));
    fireEvent.click(screen.getByRole("option", { name: /French/i }));
    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    expect(mockFetch).toHaveBeenCalledWith(`/api/users/${mockUser1.id}`, {
      method: "PATCH",
      body: JSON.stringify({ language: "fr" }),
    });

    expect(screen.getByText("The settings have been updated!")).toBeInTheDocument();
  });

  it("should display an error message when the API call fails", async () => {
    const mockResponse: ApiResponse = {
      success: false,
      message: "Failed to update settings",
    };

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse));

    render(<SettingsForm session={mockSession} />);

    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }));

    await waitFor(() => expect(screen.getByText("Failed to update settings")).toBeInTheDocument());
  });

  it("should update the language cookie and redirects", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The settings have been updated!",
    };

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse));

    render(<SettingsForm session={mockSession} />);

    fireEvent.click(screen.getByTestId("settings_select_language"));
    fireEvent.click(screen.getByRole("option", { name: /French/i }));
    fireEvent.click(screen.getByRole("button", { name: /Update Settings/i }));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    expect(mockFetch).toHaveBeenCalledWith(`/api/users/${mockUser1.id}`, {
      method: "PATCH",
      body: JSON.stringify({ language: "fr" }),
    });

    await new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, 1000));

    await waitFor(() => {
      expect(mockUseRouter.push).toHaveBeenCalledWith("/fr/account/settings");
    });
  });
});
