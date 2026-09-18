/**
 * How long a finished workspace stays in its own "Recently done" group before it joins Done.
 *
 * Minutes rather than a boolean, because the useful window depends on how you work: a window
 * long enough to survive a coffee is noise for someone watching a queue. `0` is off, and is the
 * default, so the sidebar groups exactly as it does today until you ask for the split.
 *
 * Pure on purpose, like `row-items.ts` and `checks-display.ts`: `hooks/use-settings/storage.ts`
 * validates the persisted value through `parseSidebarRecentlyDoneWindowMinutes`.
 */

export const SIDEBAR_RECENTLY_DONE_WINDOWS = [0, 1, 5, 15, 30, 60] as const;

export type SidebarRecentlyDoneWindowMinutes = (typeof SIDEBAR_RECENTLY_DONE_WINDOWS)[number];

export const DEFAULT_SIDEBAR_RECENTLY_DONE_WINDOW: SidebarRecentlyDoneWindowMinutes = 0;

const MS_PER_MINUTE = 60_000;

/**
 * The group ages rows out on a timer rather than on a re-render, so the tick has to be short
 * enough that a row does not visibly overstay its window and long enough that a one-hour window
 * is not re-grouping the sidebar every five seconds. A quarter of the window, clamped, is the
 * ratio the feature shipped with: the worst-case overstay is a quarter of a short window and a
 * flat minute of a long one.
 */
const MIN_RECENTLY_DONE_TICK_MS = 5_000;
const MAX_RECENTLY_DONE_TICK_MS = 60_000;

export function parseSidebarRecentlyDoneWindowMinutes(
  value: unknown,
): SidebarRecentlyDoneWindowMinutes {
  const match = SIDEBAR_RECENTLY_DONE_WINDOWS.find((option) => option === value);
  return match ?? DEFAULT_SIDEBAR_RECENTLY_DONE_WINDOW;
}

export function recentlyDoneWindowMs(minutes: SidebarRecentlyDoneWindowMinutes): number {
  return minutes * MS_PER_MINUTE;
}

/** `null` when nothing ages, which is what tells `useNowTick` not to schedule a timer at all. */
export function resolveRecentlyDoneTickMs(windowMs: number): number | null {
  if (windowMs <= 0) return null;
  return Math.min(
    MAX_RECENTLY_DONE_TICK_MS,
    Math.max(MIN_RECENTLY_DONE_TICK_MS, Math.round(windowMs / 4)),
  );
}
