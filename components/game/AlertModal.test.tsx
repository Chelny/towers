import { fireEvent, render, screen } from "@testing-library/react";
import AlertModal, { AlertModalProps } from "@/components/game/AlertModal";
import { ModalProvider } from "@/context/ModalContext";

const renderAlertModal = (props?: Partial<AlertModalProps>) => {
  const defaultProps: AlertModalProps = {
    title: "Test Alert",
    message: "This is a test alert message.",
    testId: "test-alert",
    onClose: vi.fn(),
  };

  render(
    <ModalProvider>
      <AlertModal {...defaultProps} {...props} />
    </ModalProvider>,
  );

  return {
    onCancel: defaultProps.onClose,
  };
};

describe("AlertModal Component", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = vi.fn();
    HTMLDialogElement.prototype.close = vi.fn();
  });

  it("should render the modal with title, message and close button", () => {
    renderAlertModal();
    expect(screen.getByText("Test Alert")).toBeInTheDocument();
    expect(screen.getByText("This is a test alert message.")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("should call onCancel when the close button is clicked", () => {
    const { onCancel } = renderAlertModal();
    fireEvent.click(screen.getByText("Close"));
    expect(onCancel).toHaveBeenCalled();
  });
});
