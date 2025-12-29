import { render, screen } from "@testing-library/react";
import Anchor from "@/components/ui/Anchor";

describe("Anchor Component", () => {
  it("should render the component correctly", () => {
    const href: string = "/home";
    const className: string = "custom-class";
    const childrenText: string = "Back to homepage";

    render(
      <Anchor href={href} className={className}>
        {childrenText}
      </Anchor>,
    );

    const linkElement: HTMLAnchorElement | null = screen.getByText(childrenText).closest("a");

    expect(linkElement).toHaveAttribute("href", href);
    expect(linkElement).toHaveClass("custom-class");
    expect(linkElement).toBeInTheDocument();
  });
});
