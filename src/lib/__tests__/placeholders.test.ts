import { describe, it, expect } from "vitest";
import { PLACEHOLDER } from "../placeholders";

describe("PLACEHOLDER", () => {
  it("has a generic placeholder path", () => {
    expect(PLACEHOLDER.generic).toBe("/images/placeholder.svg");
  });

  it("has content-type-specific placeholders", () => {
    const keys = [
      "poem",
      "photo",
      "book",
      "essay",
      "album",
      "product",
      "event",
      "portrait",
    ] as const;

    for (const key of keys) {
      expect(PLACEHOLDER[key]).toBeDefined();
      expect(typeof PLACEHOLDER[key]).toBe("string");
      expect(PLACEHOLDER[key].length).toBeGreaterThan(0);
    }
  });
});
