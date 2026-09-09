import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Расширяем expect с матчерами из jest-dom
expect.extend(matchers);

// Очищаем после каждого теста
afterEach(() => {
  cleanup();
});

// Polyfills and mocks for jsdom
if (typeof window !== "undefined") {
  window.scrollTo = vi.fn();
  window.print = vi.fn();
  if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
  if (!globalThis.IntersectionObserver) {
    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      constructor(private callback: IntersectionObserverCallback) {}
      observe = vi.fn((target: Element) => {
        this.callback(
          [
            {
              isIntersecting: true,
              target,
              boundingClientRect: target.getBoundingClientRect(),
              intersectionRatio: 1,
              intersectionRect: target.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          this
        );
      });
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  }
  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }
  if (!window.Element.prototype.scrollIntoView) {
    window.Element.prototype.scrollIntoView = vi.fn();
  }
  if (!window.HTMLElement.prototype.hasPointerCapture) {
    window.HTMLElement.prototype.hasPointerCapture = vi.fn();
  }
  if (!window.HTMLElement.prototype.setPointerCapture) {
    window.HTMLElement.prototype.setPointerCapture = vi.fn();
  }
  if (!globalThis.ResizeObserver) {
    class MockResizeObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
    window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  }
}


