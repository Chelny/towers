import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Mock } from "vitest";
import { ChangeEmailForm } from "@/app/[locale]/(protected)/account/profile/change-email.form";
import { mockSession } from "@/test/data/session";
import { mockUseRouter } from "@/vitest.setup";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    changeEmail: vi.fn(),
  },
}));

describe("Change Email Form", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with all elements", () => {
    render(<ChangeEmailForm session={mockSession} />);

    expect(screen.getByText(/Change Email/i)).toBeInTheDocument();
    expect(screen.getByTestId("profile_input-email_email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Send Verification Email/i })).toBeInTheDocument();
  });

  it("should correctly mark form fields as required", () => {
    render(<ChangeEmailForm session={mockSession} />);

    expect(screen.getByTestId("profile_input-email_email")).toHaveAttribute("required");
  });

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<ChangeEmailForm session={mockSession} />);

    fireEvent.input(screen.getByTestId("profile_input-email_email"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Send Verification Email/i }));

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument();
  });

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const mockChangeEmail: Mock = authClient.changeEmail as Mock;

    mockChangeEmail.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onSuccess();
    });
    render(<ChangeEmailForm session={mockSession} />);

    fireEvent.input(screen.getByTestId("profile_input-email_email"), { target: { value: "john.doe@example.com" } });

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Send Verification Email/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByText(
          /A verification email has been sent to your new email address. Please check your inbox or your spam folder/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
