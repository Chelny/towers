import { usePathname } from "next/navigation";
import { i18n } from "@lingui/core";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/Breadcrumb";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

describe("Breadcrumb", () => {
  beforeAll(() => {
    i18n.activate("en");
  });

  it("should render breadcrumb structure correctly", () => {
    vi.mocked(usePathname).mockReturnValue("/home");

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const homeLink: HTMLElement = screen.getByText("Home");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should render breadcrumb links correctly based on the path", () => {
    vi.mocked(usePathname).mockReturnValue("/account/profile");

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByText("Home")).toHaveAttribute("href", "/");
    expect(screen.getByText("Account")).toHaveAttribute("href", "/account");
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Profile")).not.toHaveAttribute("href");
  });

  it("should render breadcrumb with separators", () => {
    vi.mocked(usePathname).mockReturnValue("/account/settings");

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const separators: HTMLElement[] = screen.getAllByText("/");
    expect(separators).toHaveLength(2);
  });

  it("should render breadcrumb links with hyphenated names", () => {
    vi.mocked(usePathname).mockReturnValue("/account/change-password");

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Change Password</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });

  it("should render breadcrumb with ellipsis when path is too long", () => {
    vi.mocked(usePathname).mockReturnValue("/very/long/path/to/account/settings");

    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis />
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Settings</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    expect(screen.getByText("...")).toBeInTheDocument();
  });
});
