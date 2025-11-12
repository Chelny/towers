import React, { ReactNode, useEffect } from "react";
import { act, render, waitFor } from "@testing-library/react";
import { Mock } from "vitest";
import { useOnScreen } from "@/hooks/useOnScreen";

let mockObserverCallback: IntersectionObserverCallback | undefined;
let mockObserverOptions: IntersectionObserverInit | undefined;
const mockDisconnect: Mock = vi.fn();

const triggerObserver = async (el: HTMLElement, data: Partial<IntersectionObserverEntry>) => {
  await waitFor(() => {
    if (typeof mockObserverCallback !== "function") {
      throw new Error("mockObserverCallback not initialized");
    }
  });

  const entry: IntersectionObserverEntry = {
    boundingClientRect: el.getBoundingClientRect(),
    intersectionRatio: data.intersectionRatio ?? 0,
    intersectionRect: el.getBoundingClientRect(),
    isIntersecting: data.isIntersecting ?? false,
    rootBounds: null,
    target: el,
    time: performance.now(),
  };

  act(() => {
    mockObserverCallback!([entry], {} as IntersectionObserver);
  });
};

const TestComponent = ({ onVisibleChange }: { onVisibleChange?: (visible: boolean) => void }): ReactNode => {
  const [observerRef, isVisible] = useOnScreen<HTMLDivElement>();

  useEffect(() => {
    onVisibleChange?.(isVisible);
  }, [isVisible]);

  return (
    <div
      ref={observerRef}
      style={{
        visibility: "visible",
        display: "block",
        width: "100px",
        height: "100px",
      }}
      data-visible={isVisible ? "true" : "false"}
      data-testid="target"
    >
      Test
    </div>
  );
};

const mockOffsetParent = (el: HTMLElement) => {
  // Mock offsetParent to simulate element is attached to layout
  Object.defineProperty(el, "offsetParent", {
    get: () => ({}),
    configurable: true,
  });
};

describe("useOnScreen", () => {
  beforeEach(() => {
    const mockIntersectionObserver: Mock = vi.fn((callback, options) => {
      mockObserverCallback = callback;
      mockObserverOptions = options;

      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: mockDisconnect,
      };
    });

    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    mockObserverCallback = undefined;
    mockObserverOptions = undefined;
    mockDisconnect.mockClear();
  });

  it("should return true when element is at least 50% visible and CSS visibility is visible", async () => {
    const { getByTestId } = render(<TestComponent />);
    const el: HTMLElement = getByTestId("target");

    el.style.visibility = "visible";

    mockOffsetParent(el);

    await triggerObserver(el, {
      isIntersecting: true,
      intersectionRatio: 0.6,
    });

    expect(el.dataset.visible).toBe("true");
  });

  it("should return false when element is less than 50% visible", async () => {
    const { getByTestId } = render(<TestComponent />);
    const el: HTMLElement = getByTestId("target");

    el.style.visibility = "visible";

    mockOffsetParent(el);

    await triggerObserver(el, {
      isIntersecting: true,
      intersectionRatio: 0.3,
    });

    expect(el.dataset.visible).toBe("false");
  });

  it("should return false when element is hidden with visibility: hidden", async () => {
    const { getByTestId } = render(<TestComponent />);
    const el: HTMLElement = getByTestId("target");

    el.style.visibility = "hidden";

    mockOffsetParent(el);

    await triggerObserver(el, {
      isIntersecting: true,
      intersectionRatio: 0.9,
    });

    expect(el.dataset.visible).toBe("false");
  });

  it("should pass threshold option to IntersectionObserver", () => {
    const CustomComponent = () => {
      const [ref] = useOnScreen<HTMLDivElement>({ threshold: 0.8 });
      return <div ref={ref}>Test</div>;
    };

    render(<CustomComponent />);
    expect(mockObserverOptions?.threshold).toBe(0.8);
  });

  it("should disconnect observer on unmount", () => {
    const { unmount } = render(<TestComponent />);
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
