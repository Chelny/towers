import { fireEvent, render, screen } from "@testing-library/react";
import { Mock } from "vitest";
import RadioButtonGroup from "@/components/ui/RadioButtonGroup";

describe("RadioButtonGroup", () => {
  it("should render a group of radio buttons", () => {
    render(
      <RadioButtonGroup id="test-group" label="Select an option">
        <RadioButtonGroup.Option id="option1" label="Option 1" value="1" />
        <RadioButtonGroup.Option id="option2" label="Option 2" value="2" />
      </RadioButtonGroup>,
    );

    expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
  });

  it("should select a radio button when clicked", () => {
    render(
      <RadioButtonGroup id="test-group" label="Select an option">
        <RadioButtonGroup.Option id="option1" label="Option 1" value="1" />
        <RadioButtonGroup.Option id="option2" label="Option 2" value="2" />
      </RadioButtonGroup>,
    );

    const radio1: HTMLInputElement = screen.getByLabelText("Option 1");
    const radio2: HTMLInputElement = screen.getByLabelText("Option 2");

    fireEvent.click(radio1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();

    fireEvent.click(radio2);
    expect(radio2).toBeChecked();
    expect(radio1).not.toBeChecked();
  });

  it("should call onChange when a radio button is clicked", () => {
    const handleChange: Mock = vi.fn();

    render(
      <RadioButtonGroup id="test-group" label="Select an option" onChange={handleChange}>
        <RadioButtonGroup.Option id="option1" label="Option 1" value="1" />
        <RadioButtonGroup.Option id="option2" label="Option 2" value="2" />
      </RadioButtonGroup>,
    );

    fireEvent.click(screen.getByLabelText("Option 1"));
    expect(handleChange).toHaveBeenCalled();
  });
});
