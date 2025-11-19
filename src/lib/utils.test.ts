import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("class1", "class2");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });

  it("should handle conditional classes", () => {
    const condition = false;
    const result = cn("class1", condition && "class2", "class3");
    expect(result).toContain("class1");
    expect(result).toContain("class3");
    expect(result).not.toContain("class2");
  });

  it("should handle empty strings", () => {
    const result = cn("class1", "", "class2");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });

  it("should handle undefined and null", () => {
    const result = cn("class1", undefined, null, "class2");
    expect(result).toContain("class1");
    expect(result).toContain("class2");
  });
});

