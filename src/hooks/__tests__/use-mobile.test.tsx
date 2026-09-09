import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

describe("useIsMobile hook", () => {
  const originalInnerWidth = window.innerWidth;
  const originalMatchMedia = window.matchMedia;

  let listeners: Array<(e: MediaQueryListEvent) => void> = [];

  beforeEach(() => {
    listeners = [];
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners.push(cb);
        }
      }),
      removeEventListener: vi.fn((event: string, cb: (e: MediaQueryListEvent) => void) => {
        if (event === "change") {
          listeners = listeners.filter((l) => l !== cb);
        }
      }),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.matchMedia = originalMatchMedia;
  });

  it("returns true when window width < 768px", () => {
    window.innerWidth = 500;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    window.innerWidth = 767;
    const { result: edgeResult } = renderHook(() => useIsMobile());
    expect(edgeResult.current).toBe(true);
  });

  it("returns false when window width >= 768px", () => {
    window.innerWidth = 768;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    window.innerWidth = 1280;
    const { result: desktopResult } = renderHook(() => useIsMobile());
    expect(desktopResult.current).toBe(false);
  });

  it("updates dynamically on resize event", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resizing to mobile viewport
    act(() => {
      window.innerWidth = 480;
      listeners.forEach((listener) =>
        listener({ matches: true, media: "(max-width: 767px)" } as MediaQueryListEvent)
      );
    });
    expect(result.current).toBe(true);

    // Simulate resizing back to desktop viewport
    act(() => {
      window.innerWidth = 1024;
      listeners.forEach((listener) =>
        listener({ matches: false, media: "(max-width: 767px)" } as MediaQueryListEvent)
      );
    });
    expect(result.current).toBe(false);
  });

  it("removes event listener on unmount", () => {
    window.innerWidth = 1024;
    const { unmount } = renderHook(() => useIsMobile());

    expect(listeners.length).toBe(1);

    unmount();

    expect(listeners.length).toBe(0);
  });
});
