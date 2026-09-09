import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AppError, logError, handleApiError, showUserFriendlyError } from "../errorHandler";
import * as toastModule from "@/hooks/use-toast";

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

describe("errorHandler module", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("AppError", () => {
    it("creates an AppError instance with message, code, and statusCode", () => {
      const err = new AppError("Payment required", "PAYMENT_ERR", 402);
      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
      expect(err.name).toBe("AppError");
      expect(err.message).toBe("Payment required");
      expect(err.code).toBe("PAYMENT_ERR");
      expect(err.statusCode).toBe(402);
    });
  });

  describe("logError", () => {
    it("logs Error instances to console.error with context and stack trace in development", () => {
      const err = new Error("Something went wrong");
      logError(err, "CustomContext");

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[CustomContext]",
        "Something went wrong",
        err.stack
      );
    });

    it("defaults context to [Error] when context argument is omitted", () => {
      const err = new Error("Default error");
      logError(err);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[Error]", "Default error", err.stack);
    });

    it("handles non-Error objects and primitives safely without crashing", () => {
      expect(() => {
        logError("A simple string error", "StringContext");
        logError({ message: "arbitrary object" }, "ObjectContext");
        logError(null, "NullContext");
        logError(undefined, "UndefinedContext");
        logError(12345, "NumberContext");
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(5);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[StringContext]", "A simple string error", undefined);
      expect(consoleErrorSpy).toHaveBeenCalledWith("[NullContext]", "null", undefined);
    });
  });

  describe("handleApiError", () => {
    it("logs the error to API context and returns AppError message", () => {
      const appErr = new AppError("Custom validation error", "VALIDATION", 400);
      const result = handleApiError(appErr);

      expect(consoleErrorSpy).toHaveBeenCalledWith("[API]", "Custom validation error", appErr.stack);
      expect(result).toBe("Custom validation error");
    });

    it("returns session expired message when error is TOKEN_EXPIRED or UNAUTHORIZED", () => {
      const expiredErr = new Error("TOKEN_EXPIRED");
      expect(handleApiError(expiredErr)).toBe("Сессия истекла. Пожалуйста, войдите снова.");

      const unauthErr = new Error("UNAUTHORIZED");
      expect(handleApiError(unauthErr)).toBe("Сессия истекла. Пожалуйста, войдите снова.");
    });

    it("returns generic Error message when standard Error occurs", () => {
      const genericErr = new Error("Network connection dropped");
      expect(handleApiError(genericErr)).toBe("Network connection dropped");
    });

    it("returns fallback message for empty Error or unknown error values", () => {
      const emptyErr = new Error("");
      expect(handleApiError(emptyErr)).toBe("Произошла ошибка при выполнении запроса.");

      expect(handleApiError(null)).toBe("Произошла неизвестная ошибка. Попробуйте позже.");
      expect(handleApiError(undefined)).toBe("Произошла неизвестная ошибка. Попробуйте позже.");
      expect(handleApiError("just a string")).toBe("Произошла неизвестная ошибка. Попробуйте позже.");
    });
  });

  describe("showUserFriendlyError", () => {
    it("displays destructive toast with friendly message for standard errors", () => {
      const err = new Error("Не удалось загрузить данные");
      showUserFriendlyError(err);

      expect(toastModule.toast).toHaveBeenCalledTimes(1);
      expect(toastModule.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные",
      });
    });

    it("displays session expired message in toast when TOKEN_EXPIRED occurs", () => {
      const tokenErr = new Error("TOKEN_EXPIRED");
      showUserFriendlyError(tokenErr);

      expect(toastModule.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Ошибка",
        description: "Сессия истекла. Пожалуйста, войдите снова.",
      });
    });

    it("allows overriding with custom error message", () => {
      const err = new Error("Original low-level error");
      showUserFriendlyError(err, "Пользовательское понятное сообщение");

      expect(toastModule.toast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Ошибка",
        description: "Пользовательское понятное сообщение",
      });
    });
  });
});
