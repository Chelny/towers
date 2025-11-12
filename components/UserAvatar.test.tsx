import { ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import UserAvatar from "@/components/UserAvatar";
import { mockUser1 } from "@/test/data/user";

export const mockUseSocket = vi.fn();

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // @ts-ignore
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { priority, crossOrigin, ...restProps } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...restProps} crossOrigin={crossOrigin} role="img" alt={restProps.alt} />;
  },
}));

describe("UserAvatar", () => {
  it("should render user avatar", () => {
    render(<UserAvatar user={mockUser1} />);

    const image: HTMLImageElement = screen.getByRole("img");
    expect(image.getAttribute("src")).toBe("https://example.com/avatar.jpg");
  });
});
