import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import DeferredSection from "../DeferredSection";

describe("DeferredSection Component", () => {
  const DummyComponent = () => <div data-testid="lazy-loaded-content">Ленивый компонент загружен</div>;
  const mockLoader = () => Promise.resolve({ default: DummyComponent });
  const fallbackNode = <div data-testid="fallback-loader">Загрузка секции...</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders fallback initially and marks wrapper as aria-busy", () => {
    // Override IntersectionObserver so it does not immediately intersect
    const originalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as any;

    const { container } = render(
      <DeferredSection
        loader={mockLoader}
        fallback={fallbackNode}
        wrapperClassName="section-wrapper"
      />
    );

    expect(screen.getByTestId("fallback-loader")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(container.firstElementChild).toHaveClass("section-wrapper");

    globalThis.IntersectionObserver = originalIO;
  });

  it("mounts lazy component when IntersectionObserver triggers intersection", async () => {
    render(
      <DeferredSection
        loader={mockLoader}
        fallback={fallbackNode}
      />
    );

    // With setup.ts default IntersectionObserver, isIntersecting: true is triggered immediately
    await waitFor(() => {
      expect(screen.getByTestId("lazy-loaded-content")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("fallback-loader")).not.toBeInTheDocument();
  });

  it("mounts lazy component after requestIdleCallback fires", async () => {
    // Disable IntersectionObserver auto-trigger
    const originalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as any;

    let idleCallback: IdleRequestCallback | null = null;
    const mockRequestIdleCallback = vi.fn().mockImplementation((cb: IdleRequestCallback) => {
      idleCallback = cb;
      return 42;
    });
    const mockCancelIdleCallback = vi.fn();

    window.requestIdleCallback = mockRequestIdleCallback;
    window.cancelIdleCallback = mockCancelIdleCallback;

    render(
      <DeferredSection
        loader={mockLoader}
        fallback={fallbackNode}
      />
    );

    expect(mockRequestIdleCallback).toHaveBeenCalled();
    expect(screen.getByTestId("fallback-loader")).toBeInTheDocument();

    // Trigger idle callback
    act(() => {
      if (idleCallback) {
        idleCallback({ didTimeout: false, timeRemaining: () => 50 });
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId("lazy-loaded-content")).toBeInTheDocument();
    });

    globalThis.IntersectionObserver = originalIO;
  });

  it("mounts lazy component after setTimeout fallback when requestIdleCallback is absent", async () => {
    // Disable IntersectionObserver
    const originalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as any;

    // Delete requestIdleCallback
    const originalRIC = (window as any).requestIdleCallback;
    delete (window as any).requestIdleCallback;

    let timeoutCb: (() => void) | null = null;
    const originalSetTimeout = window.setTimeout.bind(window);
    const setTimeoutSpy = vi.spyOn(window, "setTimeout").mockImplementation((cb: any, ms: any, ...args: any[]) => {
      if (ms === 2000) {
        timeoutCb = cb;
        return 123 as any;
      }
      return originalSetTimeout(cb, ms, ...args);
    });

    render(
      <DeferredSection
        loader={mockLoader}
        fallback={fallbackNode}
      />
    );

    expect(screen.getByTestId("fallback-loader")).toBeInTheDocument();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

    setTimeoutSpy.mockRestore();

    // Trigger timeout callback
    act(() => {
      if (timeoutCb) {
        (timeoutCb as () => void)();
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId("lazy-loaded-content")).toBeInTheDocument();
    });

    (window as any).requestIdleCallback = originalRIC;
    globalThis.IntersectionObserver = originalIO;
  });

  it("cleans up observer and cancels idle callback on unmount", () => {
    const disconnectFn = vi.fn();
    const originalIO = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnectFn;
    } as any;

    const cancelIdleMock = vi.fn();
    window.requestIdleCallback = vi.fn().mockReturnValue(999);
    window.cancelIdleCallback = cancelIdleMock;

    const { unmount } = render(
      <DeferredSection
        loader={mockLoader}
        fallback={fallbackNode}
      />
    );

    unmount();

    expect(disconnectFn).toHaveBeenCalled();
    expect(cancelIdleMock).toHaveBeenCalledWith(999);

    globalThis.IntersectionObserver = originalIO;
  });
});
