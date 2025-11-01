import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  removeAuthToken,
  isTokenExpired,
} from "./auth";

describe("auth utilities", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe("getAuthToken and setAuthToken", () => {
    it("should set and get auth token", () => {
      const token = "test-token-123";
      setAuthToken(token);
      expect(getAuthToken()).toBe(token);
    });

    it("should return null when token is not set", () => {
      expect(getAuthToken()).toBeNull();
    });
  });

  describe("getRefreshToken and setRefreshToken", () => {
    it("should set and get refresh token", () => {
      const token = "refresh-token-123";
      setRefreshToken(token);
      expect(getRefreshToken()).toBe(token);
    });

    it("should return null when refresh token is not set", () => {
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe("removeAuthToken", () => {
    it("should remove both tokens", () => {
      setAuthToken("access-token");
      setRefreshToken("refresh-token");
      removeAuthToken();
      expect(getAuthToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid JWT token", () => {
      // Валидный JWT токен (не истекший)
      const validToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.test";
      expect(isTokenExpired(validToken)).toBe(false);
    });

    it("should return true for expired token", () => {
      // Истекший токен (exp в прошлом)
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE2MDAwMDAwMDB9.test";
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it("should return true for invalid token", () => {
      expect(isTokenExpired("invalid-token")).toBe(true);
    });

    it("should return true for null token", () => {
      expect(isTokenExpired(null)).toBe(true);
    });
  });
});

