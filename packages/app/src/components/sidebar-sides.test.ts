import { describe, expect, it } from "vitest";
import {
  resolveSidebarResizeDirection,
  resolveSidebarResizeEdge,
  resolveSidebarSides,
} from "@/components/sidebar-sides";

describe("sidebar sides", () => {
  it("gives each sidebar its own side", () => {
    expect(resolveSidebarSides("left")).toEqual({ agentList: "left", explorer: "right" });
    expect(resolveSidebarSides("right")).toEqual({ agentList: "right", explorer: "left" });
  });

  it("puts the resize grip on the edge facing the content", () => {
    expect(resolveSidebarResizeEdge("left")).toBe("right");
    expect(resolveSidebarResizeEdge("right")).toBe("left");
  });

  it("reads a right-hand drag backwards", () => {
    expect(resolveSidebarResizeDirection("left")).toBe(1);
    expect(resolveSidebarResizeDirection("right")).toBe(-1);
  });

  it("widens whichever sidebar is dragged away from its window edge", () => {
    const widthAfterDrag = (side: "left" | "right", translationX: number) => {
      const direction = resolveSidebarResizeDirection(side);
      const start = 300 - direction * translationX;
      return start + direction * translationX * 2;
    };

    // Dragging right widens a left sidebar and narrows a right one.
    expect(widthAfterDrag("left", 40)).toBeGreaterThan(300);
    expect(widthAfterDrag("right", 40)).toBeLessThan(300);
  });
});
