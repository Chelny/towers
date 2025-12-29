import { fireEvent, render, screen } from "@testing-library/react";
import { Mock } from "vitest";
import Checkbox from "@/components/ui/Checkbox";

describe("Checkbox Component", () => {
  it("should render checkbox with label", () => {
    render(<Checkbox id="test-checkbox" label="Accept Terms" />);

    expect(screen.getByLabelText("Accept Terms")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("should check and uncheck when clicked", () => {
    render(<Checkbox id="test-checkbox" label="Accept Terms" />);

    const checkbox: HTMLInputElement = screen.getByRole("checkbox");

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("should start checked if defaultChecked is true", () => {
    render(<Checkbox id="test-checkbox" label="Accept Terms" defaultChecked />);

    const checkbox: HTMLInputElement = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should call onChange when checked or unchecked", () => {
    const handleChange: Mock = vi.fn();

    render(<Checkbox id="test-checkbox" label="Accept Terms" onChange={handleChange} />);

    fireEvent.click(screen.getByRole("checkbox"));
    expect(handleChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is passed", () => {
    render(<Checkbox id="test-checkbox" label="Accept Terms" disabled />);

    const checkbox: HTMLInputElement = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });
});
