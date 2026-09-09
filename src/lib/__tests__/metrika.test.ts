import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Yandex Metrika utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
    // Clean up DOM scripts and window.ym
    document.querySelectorAll('script[data-name="yandex-metrika"]').forEach((s) => s.remove());
    delete (window as unknown as { ym?: unknown }).ym;
    window.history.pushState({}, "Home", "/");
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("initYandexMetrika injects script tag with proper attributes and calls ym init", async () => {
    const { initYandexMetrika } = await import("../metrika");

    initYandexMetrika("105075135");

    // Before timer fires, script should not yet be injected
    expect(document.querySelector('script[data-name="yandex-metrika"]')).toBeNull();

    // Advance past schedule timer (1500ms or 2500ms)
    vi.advanceTimersByTime(3000);

    const script = document.querySelector('script[data-name="yandex-metrika"]') as HTMLScriptElement;
    expect(script).not.toBeNull();
    expect(script.src).toBe("https://mc.yandex.ru/metrika/tag.js");
    expect(script.async).toBe(true);

    // Verify window.ym was created and initialized with counterId
    expect(window.ym).toBeDefined();
    expect(typeof window.ym).toBe("function");

    const ymStub = window.ym as unknown as { a?: unknown[][] };
    expect(ymStub.a).toBeDefined();
    expect(ymStub.a).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(["105075135", "init"]),
      ])
    );
  });

  it("initYandexMetrika does not inject duplicate script tags when called multiple times", async () => {
    const { initYandexMetrika } = await import("../metrika");

    initYandexMetrika("105075135");
    initYandexMetrika("105075135");

    vi.advanceTimersByTime(3000);

    initYandexMetrika("105075135");

    const scripts = document.querySelectorAll('script[data-name="yandex-metrika"]');
    expect(scripts.length).toBe(1);
  });

  it("initYandexMetrika skips initialization when on /admin route", async () => {
    window.history.pushState({}, "Admin", "/admin");
    const { initYandexMetrika } = await import("../metrika");

    initYandexMetrika("105075135");
    vi.advanceTimersByTime(3000);

    const script = document.querySelector('script[data-name="yandex-metrika"]');
    expect(script).toBeNull();
    expect(window.ym).toBeUndefined();
  });

  it("reachGoal calls window.ym when available", async () => {
    const mockYm = vi.fn();
    window.ym = mockYm as unknown as typeof window.ym;

    const { reachGoal } = await import("../metrika");
    reachGoal("105075135", "submit_application");

    expect(mockYm).toHaveBeenCalledWith("105075135", "reachGoal", "submit_application");
  });

  it("reachGoal provides safe fallback when window.ym is undefined", async () => {
    delete (window as unknown as { ym?: unknown }).ym;
    expect(window.ym).toBeUndefined();

    const { reachGoal } = await import("../metrika");

    // Should not throw
    expect(() => {
      reachGoal("105075135", "contact_click");
    }).not.toThrow();

    // ensureStub should have created window.ym and queued the goal
    expect(window.ym).toBeDefined();
    const ymStub = window.ym as unknown as { a?: unknown[][]; l?: number };
    expect(ymStub.a).toEqual([["105075135", "reachGoal", "contact_click"]]);
    expect(ymStub.l).toBeDefined();
  });
});
