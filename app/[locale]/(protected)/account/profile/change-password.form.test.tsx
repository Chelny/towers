import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Mock } from "vitest";
import { ChangePasswordForm } from "@/app/[locale]/(protected)/account/profile/change-password.form";
import { mockSession, mockSessionCredentialAccount, mockSessionGitHubAccount } from "@/test/data/session";
import { mockFetch, mockFetchResponse } from "@/vitest.setup";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    changePassword: vi.fn(),
  },
}));

describe("Change/Set Password Form", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the set password form with all elements", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionGitHubAccount] }} />);

    expect(screen.getByText(/Change\/Set Password/i)).toBeInTheDocument();
    expect(screen.queryByTestId("change-password_input-password_current-password")).not.toBeInTheDocument();
    expect(screen.getByTestId("set-password_input-password_password")).toBeInTheDocument();
    expect(screen.getByTestId("set-password_input-password_confirm-password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Set Password/i })).toBeInTheDocument();
  });

  it("should correctly mark the set password form fields as required", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionGitHubAccount] }} />);

    expect(screen.getByTestId("set-password_input-password_password")).toHaveAttribute("required");
    expect(screen.getByTestId("set-password_input-password_confirm-password")).toHaveAttribute("required");
  });

  it("should display error messages when the set password form is submitted with empty fields", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionGitHubAccount] }} />);

    fireEvent.click(screen.getByRole("button", { name: /Set Password/i }));

    expect(screen.getByText(/The password is invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/The password confirmation is invalid/i)).toBeInTheDocument();
  });

  it("should show an error in the set password form if passwords do not match", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionGitHubAccount] }} />);

    fireEvent.input(screen.getByTestId("set-password_input-password_password"), { target: { value: "Password1234!" } });
    fireEvent.input(screen.getByTestId("set-password_input-password_confirm-password"), {
      target: { value: "Password12345!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Set Password/i }));

    expect(screen.getByText(/The password and password confirmation do not match/i)).toBeInTheDocument();
  });

  it("should disable the submit button during the set password form submission and show a success message on successful submission", async () => {
    const mockResponse: ApiResponse = {
      success: true,
      message: "The password has been set!",
    };

    mockFetch.mockResolvedValue(mockFetchResponse(mockResponse));

    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionGitHubAccount] }} />);

    fireEvent.input(screen.getByTestId("set-password_input-password_password"), { target: { value: "Password1234!" } });
    fireEvent.input(screen.getByTestId("set-password_input-password_confirm-password"), {
      target: { value: "Password1234!" },
    });

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Set Password/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/The password has been set/i)).toBeInTheDocument();
    });
  });

  it("should render the change password form with all elements", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionCredentialAccount] }} />);

    expect(screen.getByText(/Change\/Set Password/i)).toBeInTheDocument();
    expect(screen.getByTestId("change-password_input-password_current-password")).toBeInTheDocument();
    expect(screen.getByTestId("change-password_input-password_new-password")).toBeInTheDocument();
    expect(screen.getByTestId("change-password_input-password_confirm-new-password")).toBeInTheDocument();
    expect(screen.getByTestId("change-password_checkbox_revoke-other-sessions")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Change Password/i })).toBeInTheDocument();
  });

  it("should correctly mark the change password form fields as required", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionCredentialAccount] }} />);

    expect(screen.getByTestId("change-password_input-password_current-password")).toHaveAttribute("required");
    expect(screen.getByTestId("change-password_input-password_new-password")).toHaveAttribute("required");
    expect(screen.getByTestId("change-password_input-password_confirm-new-password")).toHaveAttribute("required");
  });

  it("should display error messages when the change password form is submitted with empty fields", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionCredentialAccount] }} />);

    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

    expect(screen.getByText(/The current password is invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/The new password is invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/The new password confirmation is invalid/i)).toBeInTheDocument();
  });

  it("should show an error in the change password form if passwords do not match", () => {
    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionCredentialAccount] }} />);

    fireEvent.input(screen.getByTestId("change-password_input-password_current-password"), {
      target: { value: "Password123!" },
    });
    fireEvent.input(screen.getByTestId("change-password_input-password_new-password"), {
      target: { value: "Password1234!" },
    });
    fireEvent.input(screen.getByTestId("change-password_input-password_confirm-new-password"), {
      target: { value: "Password12345!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Change Password/i }));

    expect(screen.getByText(/The new password and new password confirmation do not match/i)).toBeInTheDocument();
  });

  it("should disable the submit button during the change password form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const mockChangePassword: Mock = authClient.changePassword as Mock;

    mockChangePassword.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onSuccess();
    });

    render(<ChangePasswordForm session={{ ...mockSession, accounts: [mockSessionCredentialAccount] }} />);

    fireEvent.input(screen.getByTestId("change-password_input-password_current-password"), {
      target: { value: "Password123!" },
    });
    fireEvent.input(screen.getByTestId("change-password_input-password_new-password"), {
      target: { value: "Password1234!" },
    });
    fireEvent.input(screen.getByTestId("change-password_input-password_confirm-new-password"), {
      target: { value: "Password1234!" },
    });

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Change Password/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/The password has been updated/i)).toBeInTheDocument();
    });
  });
});
