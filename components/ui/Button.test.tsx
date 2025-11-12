import { fireEvent, render, screen } from "@testing-library/react";
import { Mock } from "vitest";
import Button from "@/components/ui/Button";

describe("Button", () => {
  it("should render button with provided children", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("should call onClick when button is clicked", () => {
    const handleClick: Mock = vi.fn();

    render(<Button onClick={handleClick}>Click Me</Button>);

    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeDisabled();
  });

  it("should apply custom class names", () => {
    render(<Button className="custom-class">Click Me</Button>);
    expect(screen.getByText("Click Me")).toHaveClass("custom-class");
  });

  it("should set data-testid attribute when dataTestId prop is provided", () => {
    render(<Button dataTestId="test-button">Click Me</Button>);
    expect(screen.getByTestId("test-button")).toBeInTheDocument();
  });
});
