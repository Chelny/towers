import { render } from "@testing-library/react";
import AlertMessage from "@/components/ui/AlertMessage";

describe("AlertMessage", () => {
  it("should render info alert with correct styles", () => {
    const { container } = render(<AlertMessage type="info">Info message</AlertMessage>);
    expect(container.firstChild).toHaveClass("border-sky-200 bg-sky-100 text-sky-600");
  });

  it("should render warning alert with correct styles", () => {
    const { container } = render(<AlertMessage type="warning">Warning message</AlertMessage>);
    expect(container.firstChild).toHaveClass("border-amber-200 bg-amber-100 text-amber-600");
  });

  it("should render success alert with correct styles", () => {
    const { container } = render(<AlertMessage type="success">Success message</AlertMessage>);
    expect(container.firstChild).toHaveClass("border-emerald-200 bg-emerald-100 text-emerald-600");
  });

  it("should render error alert with correct styles", () => {
    const { container } = render(<AlertMessage type="error">Error message</AlertMessage>);
    expect(container.firstChild).toHaveClass("border-red-200 bg-red-100 text-red-600");
  });

  it("should render grey colour alert by default if no type is provided", () => {
    const { container } = render(<AlertMessage>Default message</AlertMessage>);
    expect(container.firstChild).toHaveClass("border-gray-200 bg-gray-100 text-transparent");
  });
});
