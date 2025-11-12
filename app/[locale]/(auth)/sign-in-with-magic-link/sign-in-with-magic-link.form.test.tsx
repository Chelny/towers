import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Mock } from "vitest";
import { SignInWithMagicLinkForm } from "@/app/[locale]/(auth)/sign-in-with-magic-link/sign-in-with-magic-link.form";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      magicLink: vi.fn(),
    },
  },
}));

describe.todo("Sign In with Magic Link Form", () => {
  it("should render the form with all elements", () => {
    render(<SignInWithMagicLinkForm />);

    expect(screen.getByTestId("sign-in-with-magic-link_input-email_email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Email Me A Sign In Link/i })).toBeInTheDocument();
  });

  it("should correctly mark form fields as required", () => {
    render(<SignInWithMagicLinkForm />);

    expect(screen.getByTestId("sign-in-with-magic-link_input-email_email")).toHaveAttribute("required");
  });

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<SignInWithMagicLinkForm />);
    fireEvent.click(screen.getByRole("button", { name: /Email Me A Sign In Link/i }));
    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument();
  });

  it("should display error messages for invalid email format", () => {
    render(<SignInWithMagicLinkForm />);

    fireEvent.input(screen.getByTestId("sign-in-with-magic-link_input-email_email"), { target: { value: "john.doe" } });
    fireEvent.click(screen.getByRole("button", { name: /Email Me A Sign In Link/i }));

    expect(screen.getByText(/The email is invalid/i)).toBeInTheDocument();
  });

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/authClient");
    const mockSignInMagicLink: Mock = authClient.signIn.magicLink as Mock;

    mockSignInMagicLink.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onSuccess();
    });

    render(<SignInWithMagicLinkForm />);

    fireEvent.input(screen.getByTestId("sign-in-with-magic-link_input-email_email"), {
      target: { value: "john.doe@example.com" },
    });

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Email Me A Sign In Link/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/We’ve sent a magic sign-in link to john\.doe@example\.com/i)).toBeInTheDocument();
    });
  });
});
