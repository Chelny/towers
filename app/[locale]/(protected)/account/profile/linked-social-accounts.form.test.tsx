import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Mock } from "vitest";
import { LinkedSocialAccountsForm } from "@/app/[locale]/(protected)/account/profile/linked-social-accounts.form";
import { AUTH_PROVIDERS } from "@/constants/auth-providers";
import { AuthProviderDetails } from "@/lib/providers";
import { mockUseSearchParams } from "@/test/mocks/router";

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(() => mockUseSearchParams),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    listAccounts: vi.fn(),
    linkSocial: vi.fn(),
  },
}));

describe.todo("Linked Social Accounts Form", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the list of social providers", () => {
    render(<LinkedSocialAccountsForm />);

    expect(screen.getByRole("heading", { name: /Linked Social Accounts/i })).toBeInTheDocument();
    AUTH_PROVIDERS.forEach((provider: AuthProviderDetails) => {
      expect(screen.getByText(provider.label)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: new RegExp(`Link ${provider.label}`, "i") })).toBeInTheDocument();
    });
  });

  it("should display error messages from API", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const mockListAccounts: Mock = authClient.listAccounts as Mock;

    mockListAccounts.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onError({ error: { message: "Session is not fresh" } });
    });

    render(<LinkedSocialAccountsForm />);

    await waitFor(() => {
      expect(authClient.listAccounts).toHaveBeenCalled();
      expect(screen.queryByText(/Session is not fresh/i)).not.toBeInTheDocument();
    });
  });

  it("should handle linking a social account", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const mockListAccounts: Mock = authClient.listAccounts as Mock;
    const mockLinkSocial: Mock = authClient.linkSocial as Mock;

    mockListAccounts.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      callbacks.onSuccess({ data: [] });
    });

    mockLinkSocial.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onSuccess({ data: { id: "mock-google-1", provider: "google" } });
    });

    render(<LinkedSocialAccountsForm />);

    await waitFor(() => {
      expect(authClient.listAccounts).toHaveBeenCalled();
    });

    const linkProviderButton: HTMLButtonElement = screen.getByRole("button", { name: /Link Google/i });
    fireEvent.click(linkProviderButton);

    expect(linkProviderButton).toBeDisabled();

    await waitFor(() => {
      const unlinkProviderButton: HTMLButtonElement = screen.getByRole("button", { name: /Unlink Google/i });
      expect(unlinkProviderButton).toBeInTheDocument();
      expect(unlinkProviderButton).toBeDisabled();
    });
  });

  it("should handle unlinking a social account", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const mockListAccounts: Mock = authClient.listAccounts as Mock;
    const mockUnlinkSocialLogin: Mock = authClient.linkSocial as Mock;

    mockListAccounts.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      callbacks.onSuccess({ data: [{ id: "mock-google-1", provider: "google" }] });
    });

    mockUnlinkSocialLogin.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onSuccess();
    });

    render(<LinkedSocialAccountsForm />);

    await waitFor(() => {
      expect(authClient.listAccounts).toHaveBeenCalled();
    });

    const unlinkProviderButton: HTMLButtonElement = screen.getByRole("button", { name: /Unlink Google/i });
    fireEvent.click(unlinkProviderButton);

    expect(unlinkProviderButton).toBeDisabled();

    await waitFor(() => {
      const linkProviderButton: HTMLButtonElement = screen.getByRole("button", { name: /Link Google/i });
      expect(linkProviderButton).toBeInTheDocument();
    });
  });
});
