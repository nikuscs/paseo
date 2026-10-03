import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIDEBAR_ROW_DENSITY,
  parseSidebarRowDensity,
  SIDEBAR_ROW_DENSITIES,
} from "./row-density";

describe("parseSidebarRowDensity", () => {
  it("leaves rows comfortable by default", () => {
    expect(DEFAULT_SIDEBAR_ROW_DENSITY).toBe("comfortable");
  });

  it.each(SIDEBAR_ROW_DENSITIES)("keeps the stored %s density", (density) => {
    expect(parseSidebarRowDensity(density)).toBe(density);
  });

  it.each([[null], [undefined], ["dense"], [true], [1], [["compact"]]])(
    "falls back to comfortable for %s",
    (value) => {
      expect(parseSidebarRowDensity(value)).toBe(DEFAULT_SIDEBAR_ROW_DENSITY);
    },
  );
});
