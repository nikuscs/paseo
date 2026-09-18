import { describe, expect, it } from "vitest";
import {
  DEFAULT_SIDEBAR_RECENTLY_DONE_WINDOW,
  parseSidebarRecentlyDoneWindowMinutes,
  recentlyDoneWindowMs,
  resolveRecentlyDoneTickMs,
  SIDEBAR_RECENTLY_DONE_WINDOWS,
} from "./recently-done";

describe("parseSidebarRecentlyDoneWindowMinutes", () => {
  it("is off by default, so the sidebar groups as it does today until asked", () => {
    expect(DEFAULT_SIDEBAR_RECENTLY_DONE_WINDOW).toBe(0);
  });

  it.each(SIDEBAR_RECENTLY_DONE_WINDOWS)("keeps the offered window %s", (minutes) => {
    expect(parseSidebarRecentlyDoneWindowMinutes(minutes)).toBe(minutes);
  });

  it.each([[7], [-5], [null], [undefined], ["15"], [[15]], [{}]])(
    "falls back to off for %s",
    (value) => {
      expect(parseSidebarRecentlyDoneWindowMinutes(value)).toBe(
        DEFAULT_SIDEBAR_RECENTLY_DONE_WINDOW,
      );
    },
  );
});

describe("resolveRecentlyDoneTickMs", () => {
  it("schedules no timer while the window is off", () => {
    expect(resolveRecentlyDoneTickMs(recentlyDoneWindowMs(0))).toBeNull();
  });

  it("clamps a short window up to the 5s floor rather than ticking every 15s", () => {
    // A quarter of one minute is 15s, but the floor is what stops a 1-minute window from
    // overstaying by a noticeable slice of itself.
    expect(resolveRecentlyDoneTickMs(recentlyDoneWindowMs(1))).toBe(15_000);
    expect(resolveRecentlyDoneTickMs(1_000)).toBe(5_000);
  });

  it("clamps a long window down to the 60s ceiling", () => {
    expect(resolveRecentlyDoneTickMs(recentlyDoneWindowMs(15))).toBe(60_000);
    expect(resolveRecentlyDoneTickMs(recentlyDoneWindowMs(60))).toBe(60_000);
  });
});
