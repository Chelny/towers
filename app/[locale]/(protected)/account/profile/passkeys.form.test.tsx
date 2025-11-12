import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Passkey } from "better-auth/plugins/passkey";
import { Mock } from "vitest";
import { PasskeysForm } from "@/app/[locale]/(protected)/account/profile/passkeys.form";
import { authClient } from "@/lib/authClient";
import { mockSession } from "@/test/data/session";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useListPasskeys: vi.fn(),
    passkey: {
      addPasskey: vi.fn(),
      updatePasskey: vi.fn(),
      deletePasskey: vi.fn(),
    },
  },
}));

describe.todo("Passkeys Form", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the form with all elements", () => {
    vi.mocked(authClient.useListPasskeys).mockReturnValue({
      data: [],
      error: null,
      isPending: false,
      refetch: vi.fn(),
      isRefetching: false,
    });

    render(<PasskeysForm />);

    expect(screen.getByText(/Passkeys/i)).toBeInTheDocument();
    expect(screen.getByTestId("passkeys_input-text_name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Passkey/i })).toBeInTheDocument();
  });

  it("should render the list of passkeys", () => {
    vi.mocked(authClient.useListPasskeys).mockReturnValue({
      data: [
        {
          id: "mock-passkey-1",
          name: "Passkey 1",
          publicKey: "",
          userId: mockSession.user.id,
          credentialID: "",
          counter: 0,
          deviceType: "singleDevice",
          backedUp: false,
          transports: "",
          createdAt: new Date(),
        },
        {
          id: "mock-passkey-2",
          name: "Passkey 2",
          publicKey: "",
          userId: mockSession.user.id,
          credentialID: "",
          counter: 0,
          deviceType: "singleDevice",
          backedUp: false,
          transports: "",
          createdAt: new Date(),
        },
      ],
      error: null,
      isPending: false,
      refetch: vi.fn(),
      isRefetching: false,
    });

    render(<PasskeysForm />);

    expect(screen.getByText(/Passkey 1/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Edit "Passkey 1" passkey/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete "Passkey 1" passkey/i })).toBeInTheDocument();
    expect(screen.getByText(/Passkey 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Edit "Passkey 2" passkey/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Delete "Passkey 2" passkey/i })).toBeInTheDocument();
  });

  it("should display error messages when submitting an empty form", () => {
    render(<PasskeysForm />);

    fireEvent.click(screen.getByRole("button", { name: /Add Passkey/i }));

    expect(screen.getByText(/Validation errors occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument();
  });

  it("should display error messages for invalid required fields", () => {
    render(<PasskeysForm />);

    fireEvent.input(screen.getByTestId("passkeys_input-text_name"), { target: { value: "Test Passkey #1" } });
    fireEvent.click(screen.getByRole("button", { name: /Add Passkey/i }));

    expect(screen.getByText(/Validation errors occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/The name is invalid/i)).toBeInTheDocument();
  });

  it("should disable the submit button during form submission and add the new passkey to the list on successful submission", async () => {
    const { authClient } = await import("@/lib/authClient");
    const mockPasskeyAddPasskey: Mock = authClient.passkey.addPasskey as Mock;

    const mockUseListPasskeys = vi.mocked(authClient.useListPasskeys);
    let passkeys: Passkey[] = [];

    mockUseListPasskeys.mockImplementation(() => ({
      data: passkeys,
      isPending: false,
      refetch: vi.fn(),
      isRefetching: false,
      error: null,
    }));

    mockPasskeyAddPasskey.mockImplementation(async (_, callbacks) => {
      callbacks.onRequest();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const newPasskey: Passkey = {
        id: "mock-passkey-1",
        name: "Test Passkey 1",
        publicKey: "",
        userId: mockSession.user.id,
        credentialID: "",
        counter: 0,
        deviceType: "singleDevice",
        backedUp: false,
        transports: "",
        createdAt: new Date(),
      };
      passkeys = [...passkeys, newPasskey];
      callbacks.onSuccess({ data: newPasskey });
    });

    render(<PasskeysForm />);

    fireEvent.input(screen.getByTestId("passkeys_input-text_name"), { target: { value: "Test Passkey 1" } });

    const submitButton: HTMLButtonElement = screen.getByRole("button", { name: /Add Passkey/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/The passkey "Test Passkey 1" has been added!/i)).toBeInTheDocument();
      expect(screen.getByText("Test Passkey 1")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Edit "Test Passkey 1" passkey/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Delete "Test Passkey 1" passkey/i })).toBeInTheDocument();
    });
  });
});
