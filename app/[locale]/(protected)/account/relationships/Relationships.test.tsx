import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { RelationshipType } from "db/enums";
import { default as mockedUseSWRInfinite } from "swr/infinite";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { Relationships } from "@/app/[locale]/(protected)/account/relationships/Relationships";
import { mockUseRouter, mockUseSearchParams } from "@/test/mocks/router";
import { mockSession } from "@/test/mocks/session";
import { mockUser2, mockUser3 } from "@/test/mocks/user";
import { UserRelationshipTableRow } from "@/types/prisma";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => mockUseRouter),
  useSearchParams: vi.fn(() => mockUseSearchParams),
  usePathname: vi.fn(() => "/en/account/relationships"),
}));

const createSWRMock = (overrides = {}) => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  isValidating: false,
  size: 1,
  setSize: vi.fn(),
  mutate: vi.fn(),
  ...overrides,
});

vi.mock("swr/infinite", () => ({
  default: vi.fn(() => createSWRMock()),
}));

describe("Relationships Component", () => {
  const mockRelationships: UserRelationshipTableRow[] = [
    {
      id: "relationship-1",
      type: RelationshipType.FOLLOWING,
      isMuted: false,
      createdAt: new Date(),
      targetUser: mockUser2,
    },
    {
      id: "relationship-2",
      type: RelationshipType.FAVORITE,
      isMuted: true,
      createdAt: new Date(),
      targetUser: mockUser3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockedUseSWRInfinite).mockReturnValue(createSWRMock());
  });

  it("should render relationships table with filters and rows", () => {
    vi.mocked(mockedUseSWRInfinite).mockReturnValue(
      createSWRMock({
        data: [
          {
            data: mockRelationships,
            pagination: { totalResults: 2, currentPage: 1, totalPages: 1, hasNextPage: false },
          },
        ],
      }),
    );

    render(<Relationships session={mockSession} />);

    expect(screen.getByTestId("relationships-filter_search_username")).toBeInTheDocument();
    expect(screen.getByTestId("relationships-filter_select_type")).toBeInTheDocument();
    expect(screen.getByTestId("relationships-filter_select_muted")).toBeInTheDocument();
    expect(screen.getByTestId("relationships-filter_button_reset")).toBeInTheDocument();

    expect(screen.getByTestId("relationships-table_heading_username")).toBeInTheDocument();
    expect(screen.getByTestId("relationships-table_heading_date")).toBeInTheDocument();

    expect(screen.getByText("jane_smith")).toBeInTheDocument();
    expect(screen.getByText("samlee")).toBeInTheDocument();

    expect(screen.getByTestId("relationships-table_[0]_select_type")).toBeInTheDocument();
    expect(screen.getByTestId("relationships-table_[0]_checkbox_muted")).toBeInTheDocument();

    expect(screen.getByTestId("relationships-table_[1]_select_type")).toBeInTheDocument();
    expect(screen.getByTestId("relationships-table_[1]_checkbox_muted")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /load more/i })).toBeInTheDocument();
  });

  it("should update the URL query param after typing in the search filter", async () => {
    vi.mocked(mockedUseSWRInfinite).mockReturnValue(
      createSWRMock({
        data: [
          {
            data: mockRelationships,
            pagination: { totalResults: 2, currentPage: 1, totalPages: 1, hasNextPage: false },
          },
        ],
      }),
    );

    render(<Relationships session={mockSession} />);

    const searchInput: HTMLInputElement = screen.getByTestId("relationships-filter_search_username");
    fireEvent.input(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(mockUseRouter.replace).toHaveBeenCalledWith(
        "/en/account/relationships?query=test&orderBy=createdAt&sort=desc",
      );
    });
  });

  it("should update relationship type and call PATCH endpoint", async () => {
    const mockFetch: Mock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const mockMutate: Mock = vi.fn();

    vi.mocked(mockedUseSWRInfinite).mockReturnValue(
      createSWRMock({
        data: [
          {
            data: mockRelationships,
            pagination: { totalResults: 2, currentPage: 1, totalPages: 1, hasNextPage: false },
          },
        ],
        mutate: mockMutate,
      }),
    );

    render(<Relationships session={mockSession} />);

    expect(screen.getByText("jane_smith")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("relationships-table_[0]_select_type"));
    fireEvent.click(screen.getByRole("option", { name: /BLOCKED/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    expect(global.fetch).toHaveBeenCalledWith(`/api/users/${mockSession.user.id}/relationships`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "relationship-1",
        type: RelationshipType.BLOCKED,
      }),
    });
  });

  it("should reset all filters when reset button is clicked", () => {
    vi.mocked(mockedUseSWRInfinite).mockReturnValue(
      createSWRMock({
        data: [
          {
            data: mockRelationships,
            pagination: { totalResults: 2, currentPage: 1, totalPages: 1, hasNextPage: false },
          },
        ],
      }),
    );

    render(<Relationships session={mockSession} />);

    const resetButton: HTMLElement = screen.getByTestId("relationships-filter_button_reset");
    fireEvent.click(resetButton);

    expect(mockUseRouter.replace).toHaveBeenCalledWith("/en/account/relationships?orderBy=createdAt&sort=desc");
  });

  it("should sort by username when clicking the username column header", () => {
    vi.mocked(mockedUseSWRInfinite).mockReturnValue(
      createSWRMock({
        data: [
          {
            data: mockRelationships,
            pagination: { totalResults: 2, currentPage: 1, totalPages: 1, hasNextPage: false },
          },
        ],
      }),
    );

    render(<Relationships session={mockSession} />);

    const usernameHeader: Element | null = screen.getByTestId("relationships-table_heading_username");
    fireEvent.click(usernameHeader);

    expect(mockUseRouter.replace).toHaveBeenCalledWith("/en/account/relationships?orderBy=username&sort=asc");
  });
});
