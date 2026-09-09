import { describe, it, expect } from "vitest";
import { isImageFile, normalizeImageFileName, prepareImageForUpload } from "./imageUtils";

describe("imageUtils", () => {
  describe("isImageFile", () => {
    it("recognizes standard image mime types", () => {
      const file = new File(["dummy content"], "photo.jpg", { type: "image/jpeg" });
      expect(isImageFile(file)).toBe(true);
    });

    it("recognizes uppercase file extensions (.JPG, .PNG, .HEIC)", () => {
      const fileJpg = new File(["dummy"], "IMG_1024.JPG", { type: "" });
      const filePng = new File(["dummy"], "SCREENSHOT.PNG", { type: "" });
      const fileHeic = new File(["dummy"], "CAMERA_PHOTO.HEIC", { type: "" });
      const fileJfif = new File(["dummy"], "PHOTO.JFIF", { type: "" });

      expect(isImageFile(fileJpg)).toBe(true);
      expect(isImageFile(filePng)).toBe(true);
      expect(isImageFile(fileHeic)).toBe(true);
      expect(isImageFile(fileJfif)).toBe(true);
    });

    it("rejects non-image files", () => {
      const textFile = new File(["hello"], "document.txt", { type: "text/plain" });
      const pdfFile = new File(["binary"], "document.pdf", { type: "application/pdf" });
      const exeFile = new File(["binary"], "program.exe", { type: "application/octet-stream" });

      expect(isImageFile(textFile)).toBe(false);
      expect(isImageFile(pdfFile)).toBe(false);
      expect(isImageFile(exeFile)).toBe(false);
    });
  });

  describe("normalizeImageFileName", () => {
    it("replaces special characters and spaces with underscores", () => {
      const normalized = normalizeImageFileName("WhatsApp Image 2025-10-23 at 16.52.46.jpeg");
      expect(normalized).toMatch(/^[a-zA-Z0-9_-]+\.jpg$/);
      expect(normalized).not.toContain(" ");
    });

    it("handles cyrillic filenames gracefully", () => {
      const normalized = normalizeImageFileName("фото тренера Василиса.png");
      expect(normalized.endsWith(".jpg")).toBe(true);
      expect(normalized).not.toContain(" ");
    });

    it("provides fallback if name is completely non-alphanumeric", () => {
      const normalized = normalizeImageFileName("???.png");
      expect(normalized).toBe("photo.jpg");
    });
  });

  describe("prepareImageForUpload", () => {
    it("returns non-image files unmodified", async () => {
      const pdfFile = new File(["dummy"], "file.pdf", { type: "application/pdf" });
      const result = await prepareImageForUpload(pdfFile);
      expect(result).toBe(pdfFile);
    });

    it("returns small already optimized files safely", async () => {
      const smallJpg = new File(["tiny"], "photo.jpg", { type: "image/jpeg" });
      const result = await prepareImageForUpload(smallJpg);
      expect(result).toBe(smallJpg);
    });
  });
});
