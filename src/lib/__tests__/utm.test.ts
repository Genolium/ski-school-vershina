import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  parseUTMParams,
  saveUTMParams,
  getStoredUTMParams,
  clearStoredUTMParams,
  initUTM,
  UTM_STORAGE_KEY,
} from "../utm";

describe("UTM Tracking Module (src/lib/utm.ts)", () => {
  beforeEach(() => {
    clearStoredUTMParams();
    vi.restoreAllMocks();
  });

  describe("parseUTMParams", () => {
    it("parses all 5 standard UTM parameters from search string", () => {
      const search =
        "?utm_source=yandex&utm_medium=cpc&utm_campaign=kids_spb&utm_content=banner_1&utm_term=ski+lessons";
      const result = parseUTMParams(search);

      expect(result).toEqual({
        utm_source: "yandex",
        utm_medium: "cpc",
        utm_campaign: "kids_spb",
        utm_content: "banner_1",
        utm_term: "ski lessons",
      });
    });

    it("handles partial UTM parameters", () => {
      const search = "?utm_source=vk&utm_campaign=winter2026";
      const result = parseUTMParams(search);

      expect(result).toEqual({
        utm_source: "vk",
        utm_campaign: "winter2026",
      });
      expect(result.utm_medium).toBeUndefined();
      expect(result.utm_content).toBeUndefined();
      expect(result.utm_term).toBeUndefined();
    });

    it("returns empty object if no UTM parameters are present", () => {
      const search = "?foo=bar&id=123";
      expect(parseUTMParams(search)).toEqual({});
      expect(parseUTMParams("")).toEqual({});
    });

    it("trims whitespace from UTM parameter values", () => {
      const search = "?utm_source=%20google%20&utm_campaign=promo%20";
      const result = parseUTMParams(search);
      expect(result.utm_source).toBe("google");
      expect(result.utm_campaign).toBe("promo");
    });
  });

  describe("saveUTMParams & getStoredUTMParams", () => {
    it("saves UTM parameters to sessionStorage and retrieves them", () => {
      const params = {
        utm_source: "yandex",
        utm_campaign: "search_brand",
      };

      saveUTMParams(params);
      const retrieved = getStoredUTMParams();

      expect(retrieved).toEqual(params);
      expect(sessionStorage.getItem(UTM_STORAGE_KEY)).toBe(JSON.stringify(params));
    });

    it("falls back to localStorage if sessionStorage throws", () => {
      const params = {
        utm_source: "vkontakte",
        utm_medium: "target",
      };

      // Mock sessionStorage.setItem to throw an error (e.g. QuotaExceededError or private browsing)
      const sessionSetItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementationOnce(() => {
          throw new Error("QuotaExceededError");
        });

      saveUTMParams(params);

      // Should have fallen back to localStorage
      expect(localStorage.getItem(UTM_STORAGE_KEY)).toBe(JSON.stringify(params));

      // When reading: mock sessionStorage.getItem to return null
      vi.spyOn(sessionStorage, "getItem").mockReturnValue(null);
      expect(getStoredUTMParams()).toEqual(params);

      sessionSetItemSpy.mockRestore();
    });

    it("handles corrupted JSON in storage gracefully", () => {
      sessionStorage.setItem(UTM_STORAGE_KEY, "invalid-json{{");
      expect(getStoredUTMParams()).toEqual({});
    });

    it("clears stored UTM params from both storages", () => {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ utm_source: "test" }));
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({ utm_source: "test" }));

      clearStoredUTMParams();

      expect(sessionStorage.getItem(UTM_STORAGE_KEY)).toBeNull();
      expect(localStorage.getItem(UTM_STORAGE_KEY)).toBeNull();
      expect(getStoredUTMParams()).toEqual({});
    });
  });

  describe("initUTM", () => {
    it("parses and stores UTM params from window.location.search if present", () => {
      // Mock window.location.search
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: "?utm_source=yandex_direct&utm_campaign=spb_families",
      } as any;

      const result = initUTM();
      expect(result).toEqual({
        utm_source: "yandex_direct",
        utm_campaign: "spb_families",
      });

      expect(getStoredUTMParams()).toEqual({
        utm_source: "yandex_direct",
        utm_campaign: "spb_families",
      });

      window.location = originalLocation;
    });

    it("returns previously stored UTM params if current URL has no UTM parameters", () => {
      saveUTMParams({ utm_source: "previous_campaign", utm_campaign: "summer" });

      const originalLocation = window.location;
      delete (window as any).location;
      window.location = {
        ...originalLocation,
        search: "",
      } as any;

      const result = initUTM();
      expect(result).toEqual({
        utm_source: "previous_campaign",
        utm_campaign: "summer",
      });

      window.location = originalLocation;
    });
  });
});
