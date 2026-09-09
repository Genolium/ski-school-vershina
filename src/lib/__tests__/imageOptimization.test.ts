import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getNetworkConnectionInfo,
  isSlowConnection,
  subscribeToNetworkChanges,
  getImageLoadingStrategy,
  createSvgBlurPlaceholder,
  getSkiBlurPlaceholder,
  supportsWebP,
  getOptimizedImageUrl,
  generateResponsiveSrcSet,
} from "../imageOptimization";

describe("imageOptimization utility for mobile ski slopes", () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  describe("Network connection awareness", () => {
    it("returns default 4G fast connection info when navigator.connection is missing", () => {
      Object.defineProperty(global, "navigator", {
        value: {},
        configurable: true,
        writable: true,
      });

      const info = getNetworkConnectionInfo();
      expect(info.effectiveType).toBe("4g");
      expect(info.saveData).toBe(false);
      expect(info.isSlow).toBe(false);
      expect(isSlowConnection()).toBe(false);
    });

    it("detects fast 4G connection accurately", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          connection: {
            effectiveType: "4g",
            saveData: false,
            downlink: 10,
            rtt: 50,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
          },
        },
        configurable: true,
        writable: true,
      });

      const info = getNetworkConnectionInfo();
      expect(info.effectiveType).toBe("4g");
      expect(info.isSlow).toBe(false);
      expect(isSlowConnection()).toBe(false);
    });

    it("flags connection as slow when effectiveType is 3g, 2g, or slow-2g (mountain slope conditions)", () => {
      const slowTypes = ["3g", "2g", "slow-2g"] as const;

      for (const type of slowTypes) {
        Object.defineProperty(global, "navigator", {
          value: {
            connection: {
              effectiveType: type,
              saveData: false,
              downlink: 1.0,
              rtt: 300,
            },
          },
          configurable: true,
          writable: true,
        });

        const info = getNetworkConnectionInfo();
        expect(info.isSlow).toBe(true);
        expect(isSlowConnection()).toBe(true);
      }
    });

    it("flags connection as slow when saveData (Data Saver) is enabled", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          connection: {
            effectiveType: "4g",
            saveData: true,
            downlink: 15,
            rtt: 40,
          },
        },
        configurable: true,
        writable: true,
      });

      expect(isSlowConnection()).toBe(true);
    });

    it("flags connection as slow when downlink is < 1.5 Mbps or RTT > 600 ms", () => {
      // Low downlink
      Object.defineProperty(global, "navigator", {
        value: {
          connection: {
            effectiveType: "4g",
            saveData: false,
            downlink: 0.8,
            rtt: 100,
          },
        },
        configurable: true,
        writable: true,
      });
      expect(isSlowConnection()).toBe(true);

      // High RTT (high latency satellite/mountain towers)
      Object.defineProperty(global, "navigator", {
        value: {
          connection: {
            effectiveType: "4g",
            saveData: false,
            downlink: 5.0,
            rtt: 800,
          },
        },
        configurable: true,
        writable: true,
      });
      expect(isSlowConnection()).toBe(true);
    });

    it("subscribes to network changes and cleans up correctly", () => {
      const addEventListener = vi.fn();
      const removeEventListener = vi.fn();

      Object.defineProperty(global, "navigator", {
        value: {
          connection: {
            effectiveType: "4g",
            saveData: false,
            addEventListener,
            removeEventListener,
          },
        },
        configurable: true,
        writable: true,
      });

      const cb = vi.fn();
      const unsubscribe = subscribeToNetworkChanges(cb);

      expect(addEventListener).toHaveBeenCalledWith("change", expect.any(Function));

      unsubscribe();
      expect(removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });
  });

  describe("Image loading strategy", () => {
    it("assigns eager, async, and high priority for priority or above-the-fold images", () => {
      const priorityStrategy = getImageLoadingStrategy({ isPriority: true });
      expect(priorityStrategy).toEqual({
        loading: "eager",
        decoding: "async",
        fetchPriority: "high",
      });

      const firstImageStrategy = getImageLoadingStrategy({ index: 0 });
      expect(firstImageStrategy).toEqual({
        loading: "eager",
        decoding: "async",
        fetchPriority: "high",
      });
    });

    it("assigns lazy loading and auto priority on normal 4G connection for non-priority images", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          connection: { effectiveType: "4g", saveData: false, downlink: 10, rtt: 50 },
        },
        configurable: true,
        writable: true,
      });

      const lazyStrategy = getImageLoadingStrategy({ index: 5 });
      expect(lazyStrategy).toEqual({
        loading: "lazy",
        decoding: "async",
        fetchPriority: "auto",
      });
    });

    it("assigns fetchPriority='low' on weak 3G slope connections for non-priority images", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          connection: { effectiveType: "3g", saveData: false },
        },
        configurable: true,
        writable: true,
      });

      const slowStrategy = getImageLoadingStrategy({ index: 5 });
      expect(slowStrategy).toEqual({
        loading: "lazy",
        decoding: "async",
        fetchPriority: "low",
      });
    });
  });

  describe("SVG Blur Placeholder Generation", () => {
    it("generates a lightweight SVG Gaussian blur data URI", () => {
      const uri = createSvgBlurPlaceholder({ width: 500, height: 300 });

      expect(uri.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
      const decodedSvg = decodeURIComponent(uri.replace("data:image/svg+xml;charset=utf-8,", ""));

      expect(decodedSvg).toContain('viewBox="0 0 500 300"');
      expect(decodedSvg).toContain("<feGaussianBlur");
      expect(decodedSvg).toContain("<linearGradient");
    });

    it("supports all ski school theme presets (mountain, snow, neutral)", () => {
      const mountain = getSkiBlurPlaceholder("mountain");
      const snow = getSkiBlurPlaceholder("snow");
      const neutral = getSkiBlurPlaceholder("neutral");

      expect(mountain).toContain("data:image/svg+xml");
      expect(snow).toContain("data:image/svg+xml");
      expect(neutral).toContain("data:image/svg+xml");
      expect(mountain).not.toEqual(snow);
    });
  });

  describe("Modern format helper and URL optimization", () => {
    it("returns boolean for supportsWebP", () => {
      const supported = supportsWebP();
      expect(typeof supported).toBe("boolean");
    });

    it("returns empty string when src is empty", () => {
      expect(getOptimizedImageUrl("")).toBe("");
    });

    it("adapts URL parameters for fast 4G connections", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          connection: { effectiveType: "4g", saveData: false, downlink: 10 },
        },
        configurable: true,
        writable: true,
      });

      const url = getOptimizedImageUrl("https://cdn.vershina.ski/photos/slopes.jpg", {
        width: 1200,
        quality: 85,
        format: "webp",
      });

      expect(url).toBe("https://cdn.vershina.ski/photos/slopes.jpg?w=1200&q=85&fm=webp");
    });

    it("throttles width and quality on slow 3G ski slope connections to save bandwidth", () => {
      Object.defineProperty(global, "navigator", {
        value: {
          connection: { effectiveType: "3g", saveData: false },
        },
        configurable: true,
        writable: true,
      });

      const url = getOptimizedImageUrl("https://cdn.vershina.ski/photos/slopes.jpg", {
        width: 1000,
        quality: 85,
        format: "webp",
      });

      // Width reduced to 60% (600px), quality capped at 60
      expect(url).toBe("https://cdn.vershina.ski/photos/slopes.jpg?w=600&q=60&fm=webp");
    });

    it("generates responsive srcset string", () => {
      const srcset = generateResponsiveSrcSet("https://cdn.vershina.ski/photo.jpg", [320, 640]);
      expect(srcset).toContain("320w");
      expect(srcset).toContain("640w");
      expect(srcset).toContain("w=");
    });
  });
});
