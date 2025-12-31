import { fireEvent, render, screen } from "@testing-library/react";
import { Mock } from "vitest";
import Select from "@/components/ui/Select";
import { ModalProvider } from "@/context/ModalContext";

describe("Select Component", () => {
  it("should render select with placeholder", () => {
    render(
      <ModalProvider>
        <Select id="test-select" label="Choose option" placeholder="Select an option">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </ModalProvider>,
    );

    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("should open dropdown when clicked", () => {
    render(
      <ModalProvider>
        <Select id="test-select" label="Choose option">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </ModalProvider>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("should select an option when clicked", () => {
    const handleChange: Mock = vi.fn();

    render(
      <ModalProvider>
        <Select id="test-select" label="Choose option" onChange={handleChange}>
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </ModalProvider>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option 1"));

    expect(handleChange).toHaveBeenCalledWith("1");
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("should close the dropdown when an option is selected", () => {
    render(
      <ModalProvider>
        <Select id="test-select" label="Choose option">
          <Select.Option value="1">Option 1</Select.Option>
          <Select.Option value="2">Option 2</Select.Option>
        </Select>
      </ModalProvider>,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Option 1"));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
