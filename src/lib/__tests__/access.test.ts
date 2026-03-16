import { describe, it, expect } from "vitest";
import { hasAccess } from "../access";

describe("hasAccess", () => {
  it("grants FREE users access to FREE content", () => {
    expect(hasAccess("FREE", "FREE")).toBe(true);
  });

  it("denies FREE users access to SUPPORTER content", () => {
    expect(hasAccess("FREE", "SUPPORTER")).toBe(false);
  });

  it("grants INNER_CIRCLE users access to all tiers", () => {
    expect(hasAccess("INNER_CIRCLE", "FREE")).toBe(true);
    expect(hasAccess("INNER_CIRCLE", "SUPPORTER")).toBe(true);
    expect(hasAccess("INNER_CIRCLE", "PATRON")).toBe(true);
    expect(hasAccess("INNER_CIRCLE", "INNER_CIRCLE")).toBe(true);
  });

  it("grants PATRON users access to SUPPORTER content", () => {
    expect(hasAccess("PATRON", "SUPPORTER")).toBe(true);
  });

  it("denies SUPPORTER users access to PATRON content", () => {
    expect(hasAccess("SUPPORTER", "PATRON")).toBe(false);
  });

  it("treats undefined user tier as FREE", () => {
    expect(hasAccess(undefined, "FREE")).toBe(true);
    expect(hasAccess(undefined, "SUPPORTER")).toBe(false);
  });

  it("treats unknown tiers as rank 0", () => {
    expect(hasAccess("UNKNOWN", "FREE")).toBe(true);
    expect(hasAccess("FREE", "UNKNOWN")).toBe(true);
  });
});
