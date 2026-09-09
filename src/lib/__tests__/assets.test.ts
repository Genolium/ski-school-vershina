import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { resolveAssetUrl } from "../assets";

describe("resolveAssetUrl utility", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("returns empty string for null, undefined, or empty path", () => {
    expect(resolveAssetUrl(null)).toBe("");
    expect(resolveAssetUrl(undefined)).toBe("");
    expect(resolveAssetUrl("")).toBe("");
  });

  it("returns external HTTP, HTTPS, and data URLs as-is", () => {
    expect(resolveAssetUrl("https://example.com/photo.jpg")).toBe("https://example.com/photo.jpg");
    expect(resolveAssetUrl("http://cdn.ski-vershina.ru/logo.svg")).toBe("http://cdn.ski-vershina.ru/logo.svg");
    expect(resolveAssetUrl("HTTPS://CDN.EXAMPLE.COM/PHOTO.WEBP")).toBe("HTTPS://CDN.EXAMPLE.COM/PHOTO.WEBP");
    expect(resolveAssetUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==")).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg=="
    );
  });

  it("returns local paths not starting with /uploads as-is", () => {
    expect(resolveAssetUrl("/images/hero.webp")).toBe("/images/hero.webp");
    expect(resolveAssetUrl("assets/photo.jpg")).toBe("assets/photo.jpg");
    expect(resolveAssetUrl("/favicon.ico")).toBe("/favicon.ico");
  });

  it("resolves /uploads paths with VITE_BACKEND_ORIGIN when configured", () => {
    vi.stubEnv("VITE_BACKEND_ORIGIN", "https://api.vershina.ru");

    expect(resolveAssetUrl("/uploads/trainers/bokulev.jpg")).toBe(
      "https://api.vershina.ru/uploads/trainers/bokulev.jpg"
    );
    expect(resolveAssetUrl("/uploads/photo_123.jpg")).toBe(
      "https://api.vershina.ru/uploads/photo_123.jpg"
    );
  });

  it("resolves /uploads paths with localhost:8080 fallback in dev mode on port 3000", () => {
    vi.stubEnv("VITE_BACKEND_ORIGIN", "");

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...originalLocation,
        port: "3000",
      },
    });

    expect(resolveAssetUrl("/uploads/trainer.png")).toBe(
      "http://localhost:8080/uploads/trainer.png"
    );
  });

  it("returns /uploads path relative when origin is empty and port is not 3000", () => {
    vi.stubEnv("VITE_BACKEND_ORIGIN", "");

    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        ...originalLocation,
        port: "80",
      },
    });

    expect(resolveAssetUrl("/uploads/winter.jpg")).toBe("/uploads/winter.jpg");
  });
});
