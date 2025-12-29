import { render, screen } from "@testing-library/react";
import type { Toast } from "@/context/ToastContext";
import { ToastContainer } from "./ToastContainer";

describe("ToastContainer Component", () => {
  it("should render nothing if there are no toasts", () => {
    render(<ToastContainer toasts={[]} />);
    expect(screen.queryByText(/.+/)).toBeNull();
  });

  it("should render a toast in the correct position", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Top Start Toast", position: "top-start" },
      { id: "2", message: "Bottom End Toast", position: "bottom-end" },
    ];

    render(<ToastContainer toasts={toasts} />);

    expect(screen.getByText("Top Start Toast")).toBeInTheDocument();
    expect(screen.getByText("Bottom End Toast")).toBeInTheDocument();
  });

  it("should render default toast in top-end if no position is specified", () => {
    const toasts: Toast[] = [{ id: "1", message: "Default Toast" }];

    render(<ToastContainer toasts={toasts} />);

    expect(screen.getByText("Default Toast")).toBeInTheDocument();
  });

  it("should apply correct container styles for each position", () => {
    const toasts: Toast[] = [
      { id: "1", message: "Top Start", position: "top-start" },
      { id: "2", message: "Top End", position: "top-end" },
      { id: "3", message: "Bottom Start", position: "bottom-start" },
      { id: "4", message: "Bottom End", position: "bottom-end" },
    ];

    render(<ToastContainer toasts={toasts} />);

    expect(screen.getByText("Top Start").parentElement?.className).toContain("top-0 start-0");
    expect(screen.getByText("Top End").parentElement?.className).toContain("top-0 end-0");
    expect(screen.getByText("Bottom Start").parentElement?.className).toContain("bottom-0 start-0");
    expect(screen.getByText("Bottom End").parentElement?.className).toContain("bottom-0 end-0");
  });

  it("should not render containers for positions with no toasts", () => {
    const toasts: Toast[] = [{ id: "1", message: "Only Top Start", position: "top-start" }];

    render(<ToastContainer toasts={toasts} />);

    expect(screen.getByText("Only Top Start")).toBeInTheDocument();
    expect(screen.queryByText("Bottom End")).toBeNull();
  });
});
