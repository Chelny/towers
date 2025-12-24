import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Mock } from "vitest";
import { PersonalInformationForm } from "@/app/[locale]/(protected)/account/profile/personal-information.form";
import { mockUseRouter } from "@/test/mocks/router";
import { mockSession } from "@/test/mocks/session";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    updateUser: vi.fn(),
  },
}));

describe("Sign Up Form", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with all elements", () => {
    render(<PersonalInformationForm session={mockSession} />);

    expect(screen.getByRole("heading", { name: /Personal Information/i })).toBeInTheDocument();
    expect(screen.getByTestId("profile_input-text_name")).toBeInTheDocument();
    expect(screen.getByTestId("profile_input-date_birthdate")).toBeInTheDocument();
    expect(screen.getByTestId("profile_input-text_username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Update Profile/i })).toBeInTheDocument();
  });

  it("should correctly mark form fields as required", () => {
    render(<PersonalInformationForm session={mockSession} />);

    expect(screen.getByTestId("profile_input-text_name")).toHaveAttribute("required");
    expect(screen.getByTestId("profile_input-date_birthdate")).not.toHaveAttribute("required");
    expect(screen.getByTestId("profile_input-text_username")).toHaveAttribute("required");
  });

  it("should display error messages when the form is submitted with empty fields", () => {
    render(<PersonalInformationForm session={mockSession} />);

    fireEvent.input(screen.getByTestId("profile_input-text_name"), { target: { value: "" } });
    fireEvent.input(screen.getByTestId("profile_input-text_username"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Update Profile/i }));

    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument();
    expect(screen.getByText(/The username is invalid/i)).toBeInTheDocument();
  });

  it("should disable the submit button during form submission and show a success message on successful submission", async () => {
    const { authClient } = await import("@/lib/auth-client");
    const mockUpdateUser: Mock = authClient.updateUser as Mock;

    mockUpdateUser.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      callbacks.onSuccess();
    });

    render(<PersonalInformationForm session={mockSession} />);

    fireEvent.input(screen.getByTestId("profile_input-text_name"), { target: { value: "John Doe" } });
    fireEvent.input(screen.getByTestId("profile_input-text_username"), { target: { value: "john.doe" } });

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Update Profile/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/Your profile has been updated/i)).toBeInTheDocument();
    });
  });
});
