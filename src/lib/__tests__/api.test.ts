import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getSchedule,
  getTariffs,
  getLocations,
  getCamps,
  getStats,
  getAbout,
  getCoaches,
  getMedia,
  createApplication,
  adminLogin,
  adminRefreshToken,
  getApplications,
  updateApplication,
  deleteApplication,
  adminGetTariffs,
  createTariff,
  updateTariff,
  deleteTariff,
  adminGetSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  adminGetLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  adminGetCamps,
  createCamp,
  updateCamp,
  deleteCamp,
  adminGetStats,
  createStat,
  updateStat,
  deleteStat,
  adminGetAbout,
  updateAbout,
  adminGetCoaches,
  createCoach,
  updateCoach,
  deleteCoach,
  adminGetMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  uploadPhoto,
} from "../api";
import { setAuthToken, removeAuthToken } from "../auth";

function createFakeJwt(expInSeconds = 3600): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + expInSeconds,
      sub: "admin",
      role: "admin",
    })
  );
  return `${header}.${payload}.signature`;
}

describe("API client module", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    removeAuthToken();
    sessionStorage.clear();
  });

  describe("Public GET endpoints", () => {
    it("getSchedule returns schedule items on success", async () => {
      const mockData = [{ id: 1, group: "Kids 1", age_range: "4-6" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getSchedule();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/schedule");
    });

    it("getSchedule throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getSchedule()).rejects.toThrow("Failed to fetch schedule");
    });

    it("getTariffs returns tariffs on success", async () => {
      const mockData = [{ id: 1, title: "Standard", price: "10000" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getTariffs();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/tariffs");
    });

    it("getTariffs throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getTariffs()).rejects.toThrow("Failed to fetch tariffs");
    });

    it("getLocations returns locations on success", async () => {
      const mockData = [{ id: 1, title: "Oхта Парк" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getLocations();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/locations");
    });

    it("getLocations throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getLocations()).rejects.toThrow("Failed to fetch locations");
    });

    it("getCamps returns camps on success", async () => {
      const mockData = [{ id: 1, title: "Кировск Winter Camp" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getCamps();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/camps");
    });

    it("getCamps throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getCamps()).rejects.toThrow("Failed to fetch camps");
    });

    it("getStats returns statistics on success", async () => {
      const mockData = [{ id: 1, label: "Учеников", value: "350" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getStats();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/stats");
    });

    it("getStats throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getStats()).rejects.toThrow("Failed to fetch stats");
    });

    it("getAbout returns about section content on success", async () => {
      const mockData = { id: 1, title: "О школе", description: "Инфо", paragraphs: "Текст" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getAbout();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/about");
    });

    it("getAbout throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getAbout()).rejects.toThrow("Failed to fetch about");
    });

    it("getCoaches returns coaches list on success", async () => {
      const mockData = [{ id: 1, name: "Иван Иванов", position: "Старший тренер" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await getCoaches();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/coaches");
    });

    it("getCoaches throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getCoaches()).rejects.toThrow("Failed to fetch coaches");
    });

    it("getMedia returns media gallery and correctly appends search query parameters", async () => {
      const mockData = [{ id: 1, title: "Тренировка", media_type: "photo", category: "camps" }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      // Without params
      const resultNoParams = await getMedia();
      expect(resultNoParams).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith("/api/media");

      // With query params
      await getMedia({ category: "camps", type: "photo" });
      expect(global.fetch).toHaveBeenCalledWith("/api/media?category=camps&type=photo");
    });

    it("getMedia throws when response.ok is false", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await expect(getMedia()).rejects.toThrow("Failed to fetch media");
    });
  });

  describe("createApplication", () => {
    it("serializes payload and passes correct Content-Type and Accept headers", async () => {
      const applicationPayload = {
        name: "Алексей Смирнов",
        phone: "+7 (999) 123-45-67",
        tariff: "Pro",
        consent_given: true,
        consent_policy_version: "2026.1",
      };
      const createdRecord = { id: 42, status: "pending", ...applicationPayload, created_at: "2026-09-09" };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createdRecord,
      });

      const result = await createApplication(applicationPayload);
      expect(result).toEqual(createdRecord);

      expect(global.fetch).toHaveBeenCalledWith("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(applicationPayload),
      });
    });

    it("throws detailed error when response.ok is false with status code and error text", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => "Invalid phone number format",
      });

      await expect(
        createApplication({
          name: "Test",
          phone: "invalid",
        })
      ).rejects.toThrow("Failed to create application: 400 Invalid phone number format");

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Admin Authentication API", () => {
    it("adminLogin posts credentials and returns tokens and user profile", async () => {
      const loginResponse = {
        access_token: "mock_jwt_access",
        refresh_token: "mock_jwt_refresh",
        user: { id: 1, username: "admin", role: "admin" },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => loginResponse,
      });

      const result = await adminLogin("admin", "password123");
      expect(result).toEqual(loginResponse);
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "admin", password: "password123" }),
      });
    });

    it("adminLogin throws when login fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
      await expect(adminLogin("wrong", "credentials")).rejects.toThrow("Failed to login");
    });

    it("adminRefreshToken posts refresh token and returns new tokens", async () => {
      const refreshResponse = {
        access_token: "new_jwt_access",
        refresh_token: "new_jwt_refresh",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => refreshResponse,
      });

      const result = await adminRefreshToken("current_refresh_token");
      expect(result).toEqual(refreshResponse);
      expect(global.fetch).toHaveBeenCalledWith("/api/admin/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "current_refresh_token" }),
      });
    });

    it("adminRefreshToken throws when token refresh fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });
      await expect(adminRefreshToken("invalid_refresh_token")).rejects.toThrow(
        "Failed to refresh token"
      );
    });
  });

  describe("Authenticated Admin API calls include Authorization: Bearer <token>", () => {
    const validToken = createFakeJwt(3600);

    beforeEach(() => {
      setAuthToken(validToken);
    });

    it("getApplications includes Bearer header", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await getApplications();

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/applications",
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );

      const calls = vi.mocked(global.fetch).mock.calls;
      const headers = calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
    });

    it("updateApplication sends PUT request with status and Bearer token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 5, status: "completed" }),
      });

      await updateApplication(5, "completed");

      const calls = vi.mocked(global.fetch).mock.calls;
      expect(calls[0][0]).toBe("/api/admin/applications/5");
      expect(calls[0][1]?.method).toBe("PUT");
      const headers = calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
      expect(calls[0][1]?.body).toBe(JSON.stringify({ status: "completed" }));
    });

    it("deleteApplication sends DELETE request with Bearer token", async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      await deleteApplication(10);

      const calls = vi.mocked(global.fetch).mock.calls;
      expect(calls[0][0]).toBe("/api/admin/applications/10");
      expect(calls[0][1]?.method).toBe("DELETE");
      const headers = calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
    });

    it("Tariff CRUD functions include Bearer token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await adminGetTariffs();
      let headers = vi.mocked(global.fetch).mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);

      const newTariff = {
        title: "Test Tariff",
        description: "Desc",
        features: "[]",
        price: "5000",
        is_active: true,
        order: 1,
      };
      await createTariff(newTariff);
      headers = vi.mocked(global.fetch).mock.calls[1][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);

      await updateTariff(1, { price: "6000" });
      headers = vi.mocked(global.fetch).mock.calls[2][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);

      await deleteTariff(1);
      headers = vi.mocked(global.fetch).mock.calls[3][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
    });

    it("Schedule CRUD functions include Bearer token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await adminGetSchedule();
      await createSchedule({
        group: "New Group",
        age_range: "7-10",
        days: "Пн, Ср",
        time: "10:00",
        location: "Hill",
        spots: 5,
        is_active: true,
        order: 0,
      });
      await updateSchedule(2, { spots: 8 });
      await deleteSchedule(2);

      expect(global.fetch).toHaveBeenCalledTimes(4);
      for (const call of vi.mocked(global.fetch).mock.calls) {
        const headers = call[1]?.headers as Headers;
        expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
      }
    });

    it("Location CRUD functions include Bearer token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await adminGetLocations();
      await createLocation({
        title: "Loc 1",
        address: "Address 1",
        description: "Desc",
        features: "[]",
        icon_type: "mountain",
        order: 0,
      });
      await updateLocation(3, { title: "Updated Loc" });
      await deleteLocation(3);

      expect(global.fetch).toHaveBeenCalledTimes(4);
      for (const call of vi.mocked(global.fetch).mock.calls) {
        const headers = call[1]?.headers as Headers;
        expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
      }
    });

    it("Camps, Stats, About, Coaches, Media authenticated endpoints include Bearer token", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await adminGetCamps();
      await createCamp({
        title: "Camp",
        location: "Kirovsk",
        location_desc: "Hill",
        dates: "Dec 2026",
        duration: "7 days",
        group_size: "10",
        group_desc: "All",
        training_desc: "Daily",
        included_items: "Hotel",
        stats: "Good",
        is_active: true,
      });
      await updateCamp(1, { title: "Updated Camp" });
      await deleteCamp(1);

      await adminGetStats();
      await createStat({ label: "Count", value: "100", suffix: "+", icon_type: "users", order: 0 });
      await updateStat(1, { value: "120" });
      await deleteStat(1);

      await adminGetAbout();
      await updateAbout(1, { title: "About Us" });

      await adminGetCoaches();
      await createCoach({ name: "Coach", position: "Trainer", description: "Exp", photo: "p.jpg", order: 0 });
      await updateCoach(1, { position: "Head Coach" });
      await deleteCoach(1);

      await adminGetMedia();
      await createMedia({ title: "M", description: "D", file_path: "/f.jpg", media_type: "photo", category: "camps", order: 0, is_active: true });
      await updateMedia(1, { title: "M2" });
      await deleteMedia(1);

      for (const call of vi.mocked(global.fetch).mock.calls) {
        const headers = call[1]?.headers as Headers;
        expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
      }
    });

    it("uploadPhoto attaches Authorization header and FormData with file", async () => {
      const mockFile = new File(["dummy content"], "test-photo.jpg", { type: "image/jpeg" });
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ url: "/uploads/test-photo.webp" }),
      });

      const result = await uploadPhoto(mockFile);
      expect(result).toEqual({ url: "/uploads/test-photo.webp" });

      const calls = vi.mocked(global.fetch).mock.calls;
      expect(calls[0][0]).toBe("/api/admin/upload");
      expect(calls[0][1]?.method).toBe("POST");
      expect(calls[0][1]?.headers).toEqual({
        Authorization: `Bearer ${validToken}`,
      });
      expect(calls[0][1]?.body).toBeInstanceOf(FormData);
    });

    it("uploadPhoto throws on 401, 413, and generic error", async () => {
      const mockFile = new File(["content"], "large.jpg", { type: "image/jpeg" });

      // 401 Unauthorized
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      await expect(uploadPhoto(mockFile)).rejects.toThrow("UNAUTHORIZED");

      // 413 Payload Too Large
      setAuthToken(validToken);
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
      });
      await expect(uploadPhoto(mockFile)).rejects.toThrow("Файл слишком большой. Максимальный размер 25 МБ.");

      // Generic error with JSON message
      setAuthToken(validToken);
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server storage full" }),
      });
      await expect(uploadPhoto(mockFile)).rejects.toThrow("Server storage full");
    });
  });
});
