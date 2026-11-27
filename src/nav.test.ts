import { describe, expect, it } from "vitest";
import { surfaceFromHash } from "./nav";

describe("surfaceFromHash", () => {
  it("opens the framework page when the address has no workspace route", () => {
    expect(surfaceFromHash("")).toEqual({ kind: "public", view: "landing" });
    expect(surfaceFromHash("#/")).toEqual({ kind: "public", view: "landing" });
    expect(surfaceFromHash("#framework")).toEqual({ kind: "public", view: "landing" });
  });

  it("opens the sign-in page", () => {
    expect(surfaceFromHash("#/login")).toEqual({ kind: "public", view: "login" });
  });

  it("keeps a workspace page address", () => {
    expect(surfaceFromHash("#/forecast")).toEqual({ kind: "workspace", page: "forecast" });
  });
});
